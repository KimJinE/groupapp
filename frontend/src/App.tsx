// import { useState } from 'react'
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PrivateRoute from './assets/PrivateRoute';
import Dashboard from './Page/Dashboard';
import AuthLayout from './Login/AuthLayout';
import Login from './Login/Login';
import Register from './Login/Register';
import MainPage from './Page/MainPage';
import Profile from './Page/Profile';
import Security from './Page/ProfileSubPage/Security';
import Contact from './Page/ProfileSubPage/Contact';
import ProfileOverview from './Page/ProfileSubPage/Overview';
import Approval from './Page/Approval';

function App() {

  return (
    <Router>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register/>}/>
        </Route>
        
        <Route element={
          <PrivateRoute>
            <MainPage />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />}/>
          <Route path="approval" element={<Approval/>}/>
          <Route path="user" element={<Profile />}>
            <Route index element={<ProfileOverview />} />
            <Route path="security" element={<Security />} />  
            <Route path="contact" element={<Contact />} />  
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App
