import { Routes, Route, Navigate } from 'react-router-dom'
import Signup from './layouts/signup'
import Dashboard from './layouts/dashboard'
import GoogleCallback from './pages/GoogleCallback'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Ai from './layouts/Ai'
import News from './components/News'
import Subscription from './components/Subscription'
import Quiz from './layouts/Quiz'
import Admin from './layouts/Admin'
import Explore from './components/Explore'
//import './App.css'  
import { useEffect } from 'react'
import AdminDashboard from './layouts/Admin/Dashboard'
import Users from './layouts/Admin/Users'
import Analytics from './layouts/Admin/Analytics'
import Content from './layouts/Admin/Content'

// Detect cross-origin iframe
function isCrossOriginIframe() {
try {
  return window.top !== window.self && window.top.location.hostname !== window.location.hostname;
} catch (err) {
  // Throws if it's cross-origin
  console.error(err);
  return true;
}
}

if (isCrossOriginIframe()) {
document.body.innerHTML = '<h1>Access Denied: Cross-Origin Embedding is not allowed.</h1>';
throw new Error('Blocked due to cross-origin iframe.');
}
function App() {


useEffect(() => {
  fetch('https://api.enliten.org.in/ping', { method: 'HEAD' })
    .then(res => {
      if (!res.ok) throw new Error();
    })
    .catch(() => {
      document.body.innerHTML = '<h1>Server verification failed.</h1>';
    });
}, []);


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
      <Route path="/chat/:chatId" element={<Ai />} />
      <Route path="/chat" element={<Ai />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />
      <Route path="/news" element={
        <ProtectedRoute>
          <News />
        </ProtectedRoute>
      } />
      <Route path="/subscription" element={<Subscription />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<Users />} />
      <Route path="/admin/analytics" element={<Analytics />} />
      <Route path="/admin/content" element={<Content />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
