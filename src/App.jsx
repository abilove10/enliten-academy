import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Routes, Route, Navigate } from 'react-router-dom'
import Signup from './layouts/signup'
import Dashboard from './layouts/dashboard'
import GoogleCallback from './pages/GoogleCallback'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
//import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Routes>
      <Route path="/" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <ErrorBoundary>
            <Dashboard />
          </ErrorBoundary>
        </ProtectedRoute>
      } />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
