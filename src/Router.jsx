import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { ProductsProvider } from './context/ProductsContext'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import JuguetesPage from './pages/JuguetesPage'
import LibreriaPage from './pages/LibreriaPage'
import ElectronicaPage from './pages/ElectronicaPage'
import AdminProductsPage from './pages/AdminProductsPage'
import AdminLoginPage from './pages/AdminLoginPage'
import CartPage from './pages/CartPage'
import './App.css'

export default function Router() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ProductsProvider>
            <CartProvider>
              <Routes>
                {/* Rutas Públicas (Clientes) */}
                <Route path="/" element={<Home />} />
                <Route path="/juguetes" element={<JuguetesPage />} />
                <Route path="/libreria" element={<LibreriaPage />} />
                <Route path="/electronica" element={<ElectronicaPage />} />
                <Route path="/carrito" element={<CartPage />} />
                
                {/* Login de Administración */}
                <Route path="/admin-login" element={<AdminLoginPage />} />

                {/* Ruta Protegida: solo accesible tras iniciar sesión */}
                <Route
                  path="/admin-productos"
                  element={
                    <ProtectedRoute>
                      <AdminProductsPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </CartProvider>
          </ProductsProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
