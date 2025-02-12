import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";

//layouts
import Signup from './layouts/signup.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route>
          <Route index element={<App />} />
          <Route path="signup" element={<Signup />} />
          <Route path="*" element={<App />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
