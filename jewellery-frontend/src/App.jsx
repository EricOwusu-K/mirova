import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Products from './pages/Products'
import Register from './pages/Register'
import Login from './pages/Login'
import ProductDetails from './pages/ProductDetail'
import VirtualTryOn from './pages/VirtualTryOn'
import Orders from './pages/Orders'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminCustomers from './pages/admin/AdminCustomers'
import Help from './pages/Help'
import AdminHelpRequests from './pages/admin/AdminHelpRequests'
import AdminMessages from './pages/admin/AdminMessages'
import AdminOrderDetail from './pages/admin/AdminOrderDetail'
import AdminCustomerDetail from './pages/admin/AdminCustomerDetail'
import About from './pages/About'
import Recommended from './pages/Recommended'
import OrderDetail from './pages/OrderDetail'
import Profile from './pages/Profile'
import { useAuth } from './context/AuthContext'
import ForgotPassword from './pages/ForgotPassword'

function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user || user.role !== 'admin') return <Navigate to="/login" />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin/customers" element={<AdminRoute><AdminCustomers /></AdminRoute>} />
        <Route path="/admin/help-requests" element={<AdminRoute><AdminHelpRequests /></AdminRoute>} />
        <Route path="/admin/messages" element={<AdminRoute><AdminMessages /></AdminRoute>} />
        <Route path="/admin/orders/:id" element={<AdminRoute><AdminOrderDetail /></AdminRoute>} />
        <Route path="/admin/customers/:id" element={<AdminRoute><AdminCustomerDetail /></AdminRoute>} />
        <Route path="/*" element={
          <>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/virtual-try-on" element={<VirtualTryOn />} />
              <Route path="/recommended" element={<Recommended />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/help" element={<Help />} />
              <Route path="/about" element={<About />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Routes>
            <Footer />
          </>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App