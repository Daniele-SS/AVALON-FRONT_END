import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './menu/CSS-Menu/sidebar.css'

import Sidebar from './menu/Sidebar'

function Sistema() {
  return (
    <div className="sistema">
      <Sidebar />
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Sistema />
  </StrictMode>,
)