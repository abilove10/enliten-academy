import { Routes, Route, Navigate } from 'react-router-dom'
import Signup from './layouts/signup'
import Dashboard from './layouts/dashboard'
import GoogleCallback from './pages/GoogleCallback'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
//import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Signup />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <Dashboard />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
