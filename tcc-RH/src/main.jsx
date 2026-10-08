import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Login from './login/Login'
import Sidebar from './menu/Sidebar'

import './menu/CSS-Menu/sidebar.css'
import './login/css-login/login.css'

function Sistema() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />

        <Route path="/menu" element={<Sidebar />} />

        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Sistema />
  </StrictMode>,
)