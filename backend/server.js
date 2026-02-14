// server.js - Event Management Backend API
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { seedEvents } = require('./seedData');

const app = express();

// CORS Configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Configuration
const SECRET_KEY = process.env.JWT_SECRET || "event_management_secret_key_2026";
const PORT = process.env.PORT || 3001;
let db = null;
const db_path = path.join(__dirname, 'eventdata.db');

// ==================== DATABASE INITIALIZATION ====================

const dbInitAndConnect = async () => {
    try {
        db = await open({ filename: db_path, driver: sqlite3.Database });
        
        // Enable foreign keys for referential integrity
        await db.exec('PRAGMA foreign_keys = ON;');
        
        console.log('📊 Database connection established');

        // ===== USERS TABLE =====
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✓ Users table created');

        // ===== EVENTS TABLE =====
        await db.exec(`
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                organizer TEXT NOT NULL,
                location TEXT NOT NULL,
                date DATETIME NOT NULL,
                description TEXT,
                capacity INTEGER NOT NULL CHECK(capacity > 0),
                available_seats INTEGER NOT NULL CHECK(available_seats >= 0),
                category TEXT,
                tags TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✓ Events table created');

        // ===== REGISTRATIONS TABLE (Junction Table) =====
        await db.exec(`
            CREATE TABLE IF NOT EXISTS registrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                event_id INTEGER NOT NULL,
                registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT CHECK(status IN ('active', 'cancelled')) DEFAULT 'active',
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
                UNIQUE(user_id, event_id)
            );
        `);
        console.log('✓ Registrations table created');

        // ===== USER SESSIONS TABLE =====
        await db.exec(`
            CREATE TABLE IF NOT EXISTS user_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                token TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log('✓ User sessions table created');

        // ===== CREATE INDEXES FOR PERFORMANCE =====
        await db.exec(`
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
            CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
            CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
            CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
            CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
        `);
        console.log('✓ Database indexes created');

        // ===== SEED EVENTS DATA =====
        const seedResult = await seedEvents(db);
        if (!seedResult.success) {
            console.warn('⚠️ Event seeding failed, but server will continue');
        }

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Event Management API Server running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });

    } catch (error) {
        console.error(`❌ Database Error: ${error.message}`);
        process.exit(1);
    }
};

// Initialize database and start server
dbInitAndConnect();

// ==================== MIDDLEWARE ====================

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user info to request
 */
const authenticateToken = (request, response, next) => {
    try {
        console.log("request = ",request,request.headers)
        const authHeader = request.headers['authorization'];
        
        if (!authHeader) {
            return response.status(401).json({ 
                success: false,
                error: 'No authorization header provided' 
            });
        }

        const token = authHeader.split(' ')[1]; // Extract Bearer token
        console.log("token======")
        if (!token) {
            return response.status(401).json({ 
                success: false,
                error: 'No token provided' 
            });
        }

        // Verify JWT token
        jwt.verify(token, SECRET_KEY, async (err, decoded) => {
            if (err) {
                console.log('JWT Verification Failed:', err.message);
                return response.status(403).json({ 
                    success: false,
                    error: 'Invalid or expired token' 
                });
            }
            console.log("after jwt verify in backend")
            // Verify session exists in database
            const session = await db.get(
                `SELECT * FROM user_sessions WHERE user_id = ? AND token = ?`,
                [decoded.userId, token]
            );

            if (!session) {
                console.log(`Session not found for user ${decoded.userId}`);
                return response.status(403).json({ 
                    success: false,
                    error: 'Session expired. Please login again.' 
                });
            }

            // Attach user info to request
            request.user = decoded;
            request.token = token;
            next();
        });

    } catch (error) {
        console.error('Authentication error:', error);
        response.status(500).json({ 
            success: false,
            error: 'Authentication error' 
        });
    }
};

// ==================== AUTHENTICATION ROUTES ====================

/**
 * POST /api/auth/signup - User Registration
 * Body: { name, email, password }
 */
app.post('/api/auth/signup', async (request, response) => {
    const { name, email, password } = request.body;

    // Input validation
    if (!name || !email || !password) {
        return response.status(400).json({ 
            success: false,
            error: 'Name, email, and password are required' 
        });
    }

    if (password.length < 6) {
        return response.status(400).json({ 
            success: false,
            error: 'Password must be at least 6 characters' 
        });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return response.status(400).json({ 
            success: false,
            error: 'Invalid email format' 
        });
    }

    try {
        // Check if email already exists
        const existingUser = await db.get(
            `SELECT * FROM users WHERE email = ?`, 
            [email]
        );

        if (existingUser) {
            return response.status(400).json({ 
                success: false,
                error: 'Email already registered' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const result = await db.run(
            `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
            [name, email, hashedPassword]
        );

        // Fetch created user (without password)
        const user = await db.get(
            `SELECT id, name, email, created_at FROM users WHERE id = ?`, 
            [result.lastID]
        );

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email }, 
            SECRET_KEY, 
            { expiresIn: '7d' }
        );

        // Create session
        await db.run(
            `INSERT INTO user_sessions (user_id, token) VALUES (?, ?)`,
            [user.id, token]
        );

        response.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user
        });
        console.log("user registered successfulyy")

    } catch (error) {
        console.error('Signup error:', error);
        response.status(500).json({ 
            success: false,
            error: 'Internal server error' 
        });
    }
});

/**
 * POST /api/auth/login - User Login
 * Body: { email, password }
 */
app.post('/api/auth/login', async (request, response) => {
    const { email, password } = request.body;

    // Input validation
    if (!email || !password) {
        return response.status(400).json({ 
            success: false,
            error: 'Email and password are required' 
        });
    }

    try {
        // Find user by email
        const user = await db.get(
            `SELECT * FROM users WHERE email = ?`, 
            [email]
        );

        if (!user) {
            return response.status(401).json({ 
                success: false,
                error: 'Invalid email or password' 
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return response.status(401).json({ 
                success: false,
                error: 'Invalid email or password' 
            });
        }

        // Generate new JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email }, 
            SECRET_KEY, 
            { expiresIn: '7d' }
        );

        // Delete old session and create new one (single session per user)
        await db.run(`DELETE FROM user_sessions WHERE user_id = ?`, [user.id]);
        await db.run(
            `INSERT INTO user_sessions (user_id, token) VALUES (?, ?)`,
            [user.id, token]
        );
            console.log("insid elogin  why server is weird here ")
        response.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        response.status(500).json({ 
            success: false,
            error: 'Internal server error' 
        });
    }
});

/**
 * POST /api/auth/logout - User Logout
 * Protected route
 */
app.post('/api/auth/logout', authenticateToken, async (request, response) => {
    try {
        const { userId } = request.user;

        // Delete user session
        await db.run(
            `DELETE FROM user_sessions WHERE user_id = ?`,
            [userId]
        );

        response.json({
            success: true,
            message: 'Logout successful'
        });

    } catch (error) {
        console.error('Logout error:', error);
        response.status(500).json({ 
            success: false,
            error: 'Internal server error' 
        });
    }
});

// ==================== EVENT ROUTES ====================

/**
 * GET /api/events - Get all events with search and filters
 * Public route (no authentication required)
 * Query params: search, category, location, dateFrom, dateTo, page, limit
 */
app.get('/api/events', async (request, response) => {
    try {
        const {
            search = '',
            category = '',
            location = '',
            dateFrom = '',
            dateTo = '',
            page = 1,
            limit = 20
        } = request.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Build dynamic WHERE clause
        let whereConditions = [];
        let queryParams = [];

        // Text search (name or description)
        if (search) {
            whereConditions.push('(name LIKE ? OR description LIKE ?)');
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        // Category filter
        if (category) {
            whereConditions.push('category = ?');
            queryParams.push(category);
        }

        // Location filter
        if (location) {
            whereConditions.push('location LIKE ?');
            queryParams.push(`%${location}%`);
        }

        // Date range filter
        if (dateFrom) {
            whereConditions.push('date >= ?');
            queryParams.push(dateFrom);
        }

        if (dateTo) {
            whereConditions.push('date <= ?');
            queryParams.push(dateTo);
        }

        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}` 
            : '';

        // Get total count for pagination
        const countQuery = `SELECT COUNT(*) as total FROM events ${whereClause}`;
        const countResult = await db.get(countQuery, queryParams);
        const totalEvents = countResult.total;

        // Get paginated events
        const eventsQuery = `
            SELECT 
                id, name, organizer, location, date, description, 
                capacity, available_seats, category, tags, created_at
            FROM events 
            ${whereClause}
            ORDER BY date ASC
            LIMIT ? OFFSET ?
        `;

        const events = await db.all(eventsQuery, [...queryParams, parseInt(limit), offset]);

        // Parse tags JSON for each event
        const eventsWithParsedTags = events.map(event => ({
            ...event,
            tags: event.tags ? JSON.parse(event.tags) : []
        }));

        response.json({
            success: true,
            data: {
                events: eventsWithParsedTags,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalEvents / parseInt(limit)),
                    totalEvents,
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching events:', error);
        response.status(500).json({ 
            success: false,
            error: 'Failed to fetch events' 
        });
    }
});

/**
 * GET /api/events/:id - Get single event details
 * Public route (shows isRegistered only if authenticated)
 */
app.get('/api/events/:id', async (request, response) => {
    try {
        const { id } = request.params;
        const authHeader = request.headers['authorization'];

        // Get event details
        const event = await db.get(
            `SELECT * FROM events WHERE id = ?`,
            [id]
        );

        if (!event) {
            return response.status(404).json({ 
                success: false,
                error: 'Event not found' 
            });
        }

        // Parse tags
        event.tags = event.tags ? JSON.parse(event.tags) : [];

        // Check if user is registered (if authenticated)
        let isRegistered = false;

        if (authHeader) {
            const token = authHeader.split(' ')[1];
            
            try {
                const decoded = jwt.verify(token, SECRET_KEY);
                const registration = await db.get(
                    `SELECT * FROM registrations 
                     WHERE user_id = ? AND event_id = ? AND status = 'active'`,
                    [decoded.userId, id]
                );
                isRegistered = !!registration;
            } catch (err) {
                // Token invalid or expired, continue as unauthenticated
            }
        }

        response.json({
            success: true,
            data: {
                event,
                isRegistered
            }
        });

    } catch (error) {
        console.error('Error fetching event:', error);
        response.status(500).json({ 
            success: false,
            error: 'Failed to fetch event details' 
        });
    }
});

// ==================== REGISTRATION ROUTES ====================

/**
 * POST /api/registrations - Register for an event
 * Protected route
 * Body: { eventId }
 */
app.post('/api/registrations', authenticateToken, async (request, response) => {
    const { eventId } = request.body;
    const { userId } = request.user;

    // Input validation
    if (!eventId) {
        return response.status(400).json({ 
            success: false,
            error: 'Event ID is required' 
        });
    }

    try {
        // Start transaction simulation (SQLite auto-commits, but we'll use error handling)
        
        // Check if event exists
        const event = await db.get(
            `SELECT * FROM events WHERE id = ?`,
            [eventId]
        );

        if (!event) {
            return response.status(404).json({ 
                success: false,
                error: 'Event not found' 
            });
        }

        // Check if seats available
        if (event.available_seats <= 0) {
            return response.status(400).json({ 
                success: false,
                error: 'Event is full. No seats available.' 
            });
        }

        // Check if user has an active registration
        const activeRegistration = await db.get(
            `SELECT * FROM registrations 
             WHERE user_id = ? AND event_id = ? AND status = 'active'`,
            [userId, eventId]
        );

        if (activeRegistration) {
            return response.status(409).json({ 
                success: false,
                error: 'You are already registered for this event' 
            });
        }

        // Check if user has a cancelled registration (to update instead of insert)
        const cancelledRegistration = await db.get(
            `SELECT * FROM registrations 
             WHERE user_id = ? AND event_id = ? AND status = 'cancelled'`,
            [userId, eventId]
        );

        let registrationResult;

        if (cancelledRegistration) {
            // Reactivate cancelled registration
            await db.run(
                `UPDATE registrations 
                 SET status = 'active', registration_date = CURRENT_TIMESTAMP 
                 WHERE id = ?`,
                [cancelledRegistration.id]
            );
            registrationResult = { lastID: cancelledRegistration.id };
        } else {
            // Create new registration
            registrationResult = await db.run(
                `INSERT INTO registrations (user_id, event_id, status) 
                 VALUES (?, ?, 'active')`,
                [userId, eventId]
            );
        }

        // Decrement available seats
        await db.run(
            `UPDATE events SET available_seats = available_seats - 1 
             WHERE id = ?`,
            [eventId]
        );

        // Fetch created registration with event details
        const registration = await db.get(
            `SELECT r.*, e.name as event_name, e.date as event_date, e.location
             FROM registrations r
             JOIN events e ON r.event_id = e.id
             WHERE r.id = ?`,
            [registrationResult.lastID]
        );

        response.status(201).json({
            success: true,
            message: 'Successfully registered for event',
            data: registration
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle unique constraint violation (race condition)
        if (error.message.includes('UNIQUE constraint failed')) {
            return response.status(409).json({ 
                success: false,
                error: 'You are already registered for this event' 
            });
        }

        response.status(500).json({ 
            success: false,
            error: 'Failed to register for event' 
        });
    }
});

/**
 * DELETE /api/registrations/:eventId - Cancel event registration
 * Protected route
 */
app.delete('/api/registrations/:eventId', authenticateToken, async (request, response) => {
    const { eventId } = request.params;
    const { userId } = request.user;

    try {
        // Check if registration exists
        const registration = await db.get(
            `SELECT * FROM registrations 
             WHERE user_id = ? AND event_id = ? AND status = 'active'`,
            [userId, eventId]
        );

        if (!registration) {
            return response.status(404).json({ 
                success: false,
                error: 'Registration not found or already cancelled' 
            });
        }

        // Update registration status to cancelled (soft delete)
        await db.run(
            `UPDATE registrations SET status = 'cancelled' 
             WHERE user_id = ? AND event_id = ?`,
            [userId, eventId]
        );

        // Increment available seats
        await db.run(
            `UPDATE events SET available_seats = available_seats + 1 
             WHERE id = ?`,
            [eventId]
        );

        response.json({
            success: true,
            message: 'Registration cancelled successfully'
        });

    } catch (error) {
        console.error('Cancellation error:', error);
        response.status(500).json({ 
            success: false,
            error: 'Failed to cancel registration' 
        });
    }
});

/**
 * GET /api/registrations/my-events - Get user's registered events
 * Protected route
 * Returns: { upcoming: [], past: [] }
 */
app.get('/api/registrations/my-events', authenticateToken, async (request, response) => {
    try {
        const { userId } = request.user;
        const currentDate = new Date().toISOString();
        console.log("inside my events ========")

        // Get all active registrations with event details
        const registrations = await db.all(
            `SELECT 
                r.id as registration_id,
                r.registration_date,
                r.status,
                e.*
             FROM registrations r
             JOIN events e ON r.event_id = e.id
             WHERE r.user_id = ? AND r.status = 'active'
             ORDER BY e.date ASC`,
            [userId]
        );

        // Parse tags for each event
        const registrationsWithTags = registrations.map(reg => ({
            ...reg,
            tags: reg.tags ? JSON.parse(reg.tags) : []
        }));

        // Separate into upcoming and past events
        const upcoming = registrationsWithTags.filter(reg => reg.date >= currentDate);
        const past = registrationsWithTags.filter(reg => reg.date < currentDate);

        response.json({
            success: true,
            data: {
                upcoming,
                past,
                total: registrations.length
            }
        });

    } catch (error) {
        console.error('Error fetching user events:', error);
        response.status(500).json({ 
            success: false,
            error: 'Failed to fetch registered events' 
        });
    }
});

// ==================== UTILITY ROUTES ====================

/**
 * GET /api/categories - Get all unique event categories
 * Public route
 */
app.get('/api/categories', async (request, response) => {
    try {
        const categories = await db.all(
            `SELECT DISTINCT category FROM events WHERE category IS NOT NULL ORDER BY category`
        );

        response.json({
            success: true,
            data: categories.map(c => c.category)
        });

    } catch (error) {
        console.error('Error fetching categories:', error);
        response.status(500).json({ 
            success: false,
            error: 'Failed to fetch categories' 
        });
    }
});

/**
 * GET /api/locations - Get all unique event locations
 * Public route
 */
app.get('/api/locations', async (request, response) => {
    try {
        const locations = await db.all(
            `SELECT DISTINCT location FROM events ORDER BY location`
        );

        response.json({
            success: true,
            data: locations.map(l => l.location)
        });

    } catch (error) {
        console.error('Error fetching locations:', error);
        response.status(500).json({ 
            success: false,
            error: 'Failed to fetch locations' 
        });
    }
});

/**
 * GET /health - Health check endpoint
 * Public route
 */
app.get('/health', async (request, response) => {
    try {
        const eventCount = await db.get('SELECT COUNT(*) as count FROM events');
        const userCount = await db.get('SELECT COUNT(*) as count FROM users');

        response.json({
            success: true,
            status: 'healthy',
            database: 'connected',
            stats: {
                events: eventCount.count,
                users: userCount.count
            }
        });
    } catch (error) {
        response.status(503).json({
            success: false,
            status: 'unhealthy',
            error: error.message
        });
    }
});

// ==================== ERROR HANDLING ====================

// 404 Handler
app.use((request, response) => {
    response.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Global Error Handler
app.use((error, request, response, next) => {
    console.error('Unhandled error:', error);
    response.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

module.exports = app;