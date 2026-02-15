

const seedEvents = async (db) => {
    try {
        console.log('🌱 Starting database seeding...');

        
        const existingEvents = await db.get('SELECT COUNT(*) as count FROM events');
        
        if (existingEvents.count > 0) {
            console.log(`✓ Database already contains ${existingEvents.count} events. Skipping seed.`);
            return { success: true, message: 'Events already seeded', count: existingEvents.count };
        }

        
        const events = [
            
            {
                name: 'AI & Machine Learning Summit 2026',
                organizer: 'Tech Innovators Inc',
                location: 'San Francisco, CA',
                date: '2026-03-15 09:00:00',
                description: 'Explore the latest advancements in artificial intelligence and machine learning. Join industry leaders for keynotes, workshops, and networking.',
                capacity: 500,
                available_seats: 500,
                category: 'Technology',
                tags: JSON.stringify(['AI', 'Machine Learning', 'Tech', 'Innovation'])
            },
            {
                name: 'Web Development Bootcamp',
                organizer: 'CodeMasters Academy',
                location: 'Austin, TX',
                date: '2026-04-20 10:00:00',
                description: 'Intensive 3-day bootcamp covering React, Node.js, and modern web development practices. Hands-on coding sessions included.',
                capacity: 150,
                available_seats: 150,
                category: 'Workshop',
                tags: JSON.stringify(['Web Dev', 'React', 'Node.js', 'Coding'])
            },
            {
                name: 'Cybersecurity Conference 2026',
                organizer: 'SecureNet Global',
                location: 'New York, NY',
                date: '2026-05-10 08:30:00',
                description: 'Annual conference focused on emerging cybersecurity threats, defense strategies, and compliance regulations.',
                capacity: 800,
                available_seats: 800,
                category: 'Technology',
                tags: JSON.stringify(['Cybersecurity', 'Privacy', 'Enterprise', 'Security'])
            },


            {
                name: 'Startup Pitch Night',
                organizer: 'Venture Connect',
                location: 'Seattle, WA',
                date: '2026-03-25 18:00:00',
                description: 'Watch innovative startups pitch to angel investors and VCs. Networking session follows with refreshments.',
                capacity: 200,
                available_seats: 200,
                category: 'Networking',
                tags: JSON.stringify(['Startup', 'Investing', 'Entrepreneurship', 'Pitching'])
            },
            {
                name: 'Leadership Summit for Women',
                organizer: 'Empower Leaders',
                location: 'Chicago, IL',
                date: '2026-06-05 09:00:00',
                description: 'Empowering women in leadership roles through workshops, panel discussions, and mentorship opportunities.',
                capacity: 300,
                available_seats: 300,
                category: 'Conference',
                tags: JSON.stringify(['Leadership', 'Women', 'Career', 'Professional Development'])
            },
            {
                name: 'Digital Marketing Masterclass',
                organizer: 'Growth Hackers Co',
                location: 'Los Angeles, CA',
                date: '2026-04-15 13:00:00',
                description: 'Learn SEO, content marketing, social media strategies, and analytics from industry experts.',
                capacity: 120,
                available_seats: 120,
                category: 'Workshop',
                tags: JSON.stringify(['Marketing', 'SEO', 'Social Media', 'Business'])
            },


            {
                name: 'Jazz Under the Stars',
                organizer: 'City Arts Foundation',
                location: 'New Orleans, LA',
                date: '2026-07-12 19:00:00',
                description: 'Outdoor jazz concert featuring renowned musicians. Bring your blanket and enjoy an evening of smooth jazz.',
                capacity: 1000,
                available_seats: 1000,
                category: 'Music',
                tags: JSON.stringify(['Jazz', 'Music', 'Outdoor', 'Concert'])
            },
            {
                name: 'Modern Art Exhibition Opening',
                organizer: 'Metropolitan Gallery',
                location: 'Boston, MA',
                date: '2026-05-20 17:00:00',
                description: 'Opening night for our contemporary art exhibition featuring emerging artists. Wine and hors d\'oeuvres served.',
                capacity: 250,
                available_seats: 250,
                category: 'Arts',
                tags: JSON.stringify(['Art', 'Exhibition', 'Culture', 'Gallery'])
            },
            {
                name: 'Photography Workshop: Landscape Basics',
                organizer: 'Lens & Light Studio',
                location: 'Denver, CO',
                date: '2026-06-18 08:00:00',
                description: 'Full-day outdoor photography workshop in the Rocky Mountains. Learn composition, lighting, and post-processing.',
                capacity: 30,
                available_seats: 30,
                category: 'Workshop',
                tags: JSON.stringify(['Photography', 'Outdoors', 'Creative', 'Nature'])
            },


            {
                name: 'Yoga & Meditation Retreat',
                organizer: 'Peaceful Mind Wellness',
                location: 'Sedona, AZ',
                date: '2026-08-10 07:00:00',
                description: 'Weekend retreat focused on mindfulness, yoga practice, and holistic wellness. All skill levels welcome.',
                capacity: 50,
                available_seats: 50,
                category: 'Wellness',
                tags: JSON.stringify(['Yoga', 'Meditation', 'Wellness', 'Retreat'])
            },
            {
                name: 'Marathon Training Camp',
                organizer: 'City Runners Club',
                location: 'Portland, OR',
                date: '2026-09-01 06:00:00',
                description: 'Intensive training program for marathon preparation. Includes nutrition guidance and injury prevention workshops.',
                capacity: 100,
                available_seats: 100,
                category: 'Sports',
                tags: JSON.stringify(['Running', 'Marathon', 'Fitness', 'Training'])
            },


            {
                name: 'Science Fair for Young Innovators',
                organizer: 'STEM Education Foundation',
                location: 'Philadelphia, PA',
                date: '2026-10-15 10:00:00',
                description: 'Annual science fair showcasing projects from students grades 6-12. Awards and scholarships available.',
                capacity: 500,
                available_seats: 500,
                category: 'Education',
                tags: JSON.stringify(['Science', 'Education', 'STEM', 'Youth'])
            },
            {
                name: 'Creative Writing Workshop',
                organizer: 'Writers\' Guild',
                location: 'Minneapolis, MN',
                date: '2026-07-22 14:00:00',
                description: 'Interactive workshop on storytelling, character development, and publishing. Suitable for beginners and experienced writers.',
                capacity: 40,
                available_seats: 40,
                category: 'Workshop',
                tags: JSON.stringify(['Writing', 'Creative', 'Literature', 'Publishing'])
            },


            {
                name: 'Craft Beer Festival',
                organizer: 'Brewmasters Alliance',
                location: 'San Diego, CA',
                date: '2026-09-20 12:00:00',
                description: 'Sample craft beers from over 50 local and national breweries. Food trucks and live music included.',
                capacity: 2000,
                available_seats: 2000,
                category: 'Food & Drink',
                tags: JSON.stringify(['Beer', 'Festival', 'Food', 'Entertainment'])
            },
            {
                name: 'Farm-to-Table Cooking Class',
                organizer: 'Culinary Arts Institute',
                location: 'Nashville, TN',
                date: '2026-08-05 16:00:00',
                description: 'Learn to prepare seasonal dishes using locally sourced ingredients. Dinner included.',
                capacity: 25,
                available_seats: 25,
                category: 'Workshop',
                tags: JSON.stringify(['Cooking', 'Food', 'Culinary', 'Sustainable'])
            },


            {
                name: 'New Year Tech Expo 2026',
                organizer: 'Innovation Hub',
                location: 'Las Vegas, NV',
                date: '2026-01-10 09:00:00',
                description: 'Kick off the year with the latest tech gadgets, demos, and product launches.',
                capacity: 1500,
                available_seats: 0,
                category: 'Technology',
                tags: JSON.stringify(['Tech', 'Expo', 'Gadgets', 'Innovation'])
            },
            {
                name: 'Winter Music Festival',
                organizer: 'Sound Wave Productions',
                location: 'Miami, FL',
                date: '2026-02-01 15:00:00',
                description: 'Three-day music festival featuring electronic, hip-hop, and indie artists.',
                capacity: 5000,
                available_seats: 0,
                category: 'Music',
                tags: JSON.stringify(['Music', 'Festival', 'EDM', 'Hip-Hop'])
            },


            {
                name: 'Blockchain & Crypto Summit',
                organizer: 'Decentralize Network',
                location: 'Miami, FL',
                date: '2026-11-08 10:00:00',
                description: 'Deep dive into blockchain technology, cryptocurrency trends, and Web3 innovations.',
                capacity: 300,
                available_seats: 15,
                category: 'Technology',
                tags: JSON.stringify(['Blockchain', 'Crypto', 'Web3', 'Finance'])
            },
            {
                name: 'Sustainable Living Workshop',
                organizer: 'Green Future Initiative',
                location: 'Portland, OR',
                date: '2026-10-25 11:00:00',
                description: 'Learn practical strategies for eco-friendly living, zero-waste practices, and sustainable home solutions.',
                capacity: 60,
                available_seats: 8,
                category: 'Workshop',
                tags: JSON.stringify(['Sustainability', 'Environment', 'Green Living', 'Eco-Friendly'])
            },
            {
                name: 'Data Science & Analytics Conference',
                organizer: 'DataMinds Collective',
                location: 'San Francisco, CA',
                date: '2026-12-03 09:00:00',
                description: 'Explore data visualization, predictive analytics, and big data solutions. Workshops and case studies included.',
                capacity: 400,
                available_seats: 120,
                category: 'Technology',
                tags: JSON.stringify(['Data Science', 'Analytics', 'Big Data', 'AI'])
            }
        ];


        const insertPromises = events.map(event => {
            return db.run(
                `INSERT INTO events (name, organizer, location, date, description, capacity, available_seats, category, tags)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    event.name,
                    event.organizer,
                    event.location,
                    event.date,
                    event.description,
                    event.capacity,
                    event.available_seats,
                    event.category,
                    event.tags
                ]
            );
        });

        await Promise.all(insertPromises);

        const finalCount = await db.get('SELECT COUNT(*) as count FROM events');
        console.log(`✅ Successfully seeded ${finalCount.count} events into database`);

        return { success: true, message: 'Events seeded successfully', count: finalCount.count };

    } catch (error) {
        console.error('❌ Seeding error:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { seedEvents };