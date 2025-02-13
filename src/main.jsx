import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import '../Enliten-Backend/firebase/config.js'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { SidebarProvider } from './context/SidebarContext';

//layouts
import Signup from './layouts/signup.jsx'
import Dashboard from './layouts/dashboard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SidebarProvider>
      <BrowserRouter>
        <Routes>
          <Route>
            <Route index element={<App />} />
            <Route path="signup" element={<Signup />} />
            <Route 
              path="dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            {/* <Route path="ai-consultant" element={<ProtectedRoute><AiConsultant /></ProtectedRoute>} />
            <Route path="news" element={<ProtectedRoute><News /></ProtectedRoute>} />
            <Route path="explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
            <Route path="quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
            <Route path="features" element={<ProtectedRoute><Features /></ProtectedRoute>} />
            <Route path="about" element={<ProtectedRoute><About /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} /> */}
            <Route path="*" element={<App />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SidebarProvider>
  </StrictMode>,
)
