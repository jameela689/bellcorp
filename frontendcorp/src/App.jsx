import { useState } from 'react'
import {Routes,Route} from 'react-router-dom'; 
// import './App.css'
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

      <Route path="/signup" element={<Signup/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/events" element={<EventsPage/>}/>
      <Route path="/events/:id" element={<EventDetailPage/>}/>
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      }/>
      <Route path="/notfound" element={<NotFound/>}/>
     

    </Routes>
    </div>
  )
}

export default App
