import axios from 'axios'

/*
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
})
*/
const API = axios.create({
  baseURL: 'https://mirova-backend.onrender.com/api',
})

// Automatically attach token to every request if user is logged in
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('mirovaUser'))
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`
  }
  return config
})

// AUTH
export const registerUser = (data) => API.post('/auth/register', data)
export const loginUser = (data) => API.post('/auth/login', data)
export const getUserProfile = () => API.get('/auth/profile')
export const getWishlist = () => API.get('/auth/wishlist')
export const toggleWishlist = (productId) => API.post(`/auth/wishlist/${productId}`)

// PRODUCTS
export const getProducts = (params) => API.get('/products', { params })
export const getProductById = (id) => API.get(`/products/${id}`)
export const getFeaturedProducts = () => API.get('/products/featured')
export const getNewArrivals = () => API.get('/products/new-arrivals')
export const logInteraction = (id, type) => API.post(`/products/${id}/interact`, { type })

// CART
export const getCart = () => API.get('/cart')
export const addToCart = (productId, quantity, size) => API.post('/cart', { productId, quantity, size })
export const updateCartItem = (productId, quantity, size) => API.put(`/cart/${productId}`, { quantity, size })
export const removeFromCart = (productId, size) => API.delete(`/cart/${productId}`, { params: { size } })
export const clearCart = () => API.delete('/cart')

// ORDERS
export const createOrder = (data) => API.post('/orders', data)
export const getMyOrders = () => API.get('/orders/myorders')
export const getOrderById = (id) => API.get(`/orders/${id}`)

// NOTIFICATIONS
export const getNotifications = () => API.get('/notifications')
export const getUnreadCount = () => API.get('/notifications/count')
export const markAsRead = (id) => API.put(`/notifications/${id}/read`)
export const markAllAsRead = () => API.put('/notifications/read-all')

//RECOMMENDATION
export const getRecommendations = () => API.get('/products/recommended')