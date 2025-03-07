import { Routes, Route, Navigate } from 'react-router-dom'
import Signup from './layouts/signup'
import Dashboard from './layouts/dashboard'
import GoogleCallback from './pages/GoogleCallback'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Ai from './layouts/Ai'
import News from './components/News'
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
      <Route path="/ai-consultant" element={<Ai />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />
      <Route path="/news" element={
        <ProtectedRoute>
          <News />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
