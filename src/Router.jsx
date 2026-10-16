import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import OrderTrackingPage from './pages/OrderTrackingPage'
import ProductDetailPage from './pages/ProductDetailPage'
import StoreHelpPage from './pages/StoreHelpPage'
import FavoritesPage from './pages/FavoritesPage'
import './App.css'
import './pages/StorefrontHome.css'
import './styles/typography.css'
import './styles/interface.css'
import './styles/shopping-experience.css'

export default function Router() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ProductsProvider>
            <CartProvider>
              <Routes>
                {/* --- RUTAS PÚBLICAS DE TIENDA (CLIENTES) --- */}
                <Route path="/" element={<Home />} />
                <Route path="/producto/:id" element={<ProductDetailPage />} />
                <Route path="/juguetes" element={<JuguetesPage />} />
                <Route path="/libreria" element={<LibreriaPage />} />
                <Route path="/electronica" element={<ElectronicaPage />} />
                <Route path="/carrito" element={<CartPage />} />
                <Route path="/seguimiento" element={<OrderTrackingPage />} />
                <Route path="/ayuda" element={<StoreHelpPage />} />
                <Route path="/favoritos" element={<FavoritesPage />} />

                {/* --- RUTAS DEDICADAS DE ADMINISTRACIÓN (BACKOFFICE) --- */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminProductsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Redirecciones de compatibilidad */}
                <Route path="/admin-login" element={<Navigate to="/admin/login" replace />} />
                <Route path="/admin-productos" element={<Navigate to="/admin" replace />} />
              </Routes>
            </CartProvider>
          </ProductsProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
