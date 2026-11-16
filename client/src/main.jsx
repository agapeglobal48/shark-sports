import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { CatalogProvider } from './context/CatalogContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {/* Respect the visitor's "reduce motion" setting */}
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          <CatalogProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </CatalogProvider>
        </AuthProvider>
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>,
)
