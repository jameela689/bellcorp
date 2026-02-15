import { useState } from 'react'
import {Routes,Route,Navigate} from 'react-router-dom'; 
import Signup from './Components/Signup/Signup';
import Login from './Components/Login/Login';
import {ProtectedRoute} from './Components/ProtectedRoute/ProtectedRoute'
import DashboardPage from './Components/EventDashboard/DashboardPage/DashboardPage';
import EventsPage from './Components/EventDashboard/EventsPage/EventsPage';
import EventDetailPage from './Components/EventDashboard/EventDetailPage/EventDetailPage';
import {NotFound} from './Components/EventDashboard/NotFound/NotFound'
import Navbar from './Components/EventDashboard/Navbar/Navbar';
function App() {


  return (
    <div className='app'>
    <Navbar/>
    <Routes>
    <Route path="/" element={<Navigate to="/events" replace/>}/>
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/events" element={<EventsPage/>}/>
      
      <Route path="/events/:id" element={<EventDetailPage/>}/>
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      }/>
      <Route path="*" element={<NotFound/>}/>
     

    </Routes>
    </div>
  )
}

export default App
