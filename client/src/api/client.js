import axios from 'axios'
import { API_URL } from '../config.js'

export const http = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send the login cookie
})

// Turn API errors into { status, message, errors } so pages can show them easily.
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err.response?.data
    return Promise.reject({
      status: err.response?.status ?? 0,
      message: data?.message || (err.response ? 'Something went wrong' : 'Cannot reach the server'),
      errors: data?.errors ?? {},
    })
  },
)

const get = (url, params) => http.get(url, { params }).then((r) => r.data)
const post = (url, body) => http.post(url, body).then((r) => r.data)
const patch = (url, body) => http.patch(url, body).then((r) => r.data)
const del = (url) => http.delete(url).then((r) => r.data)

// Admin-only calls (the server rejects them for anyone else).
export const adminApi = {
  stats: () => get('/admin/stats'),
  orders: (params) => get('/admin/orders', params),
  order: (id) => get(`/admin/orders/${id}`).then((d) => d.order),
  updateOrder: (id, body) => patch(`/admin/orders/${id}`, body),
  products: (params) => get('/products', { status: 'all', ...params }),
  product: (id) => get(`/products/${id}`).then((d) => d.product),
  createProduct: (body) => post('/products', body).then((d) => d.product),
  updateProduct: (id, body) => patch(`/products/${id}`, body).then((d) => d.product),
  deleteProduct: (id) => del(`/products/${id}`),

  addColor: (productId, body) => post(`/products/${productId}/colors`, body).then((d) => d.color),
  updateColor: (id, body) => patch(`/colors/${id}`, body).then((d) => d.color),
  deleteColor: (id) => del(`/colors/${id}`),

  addVariant: (colorId, body) => post(`/colors/${colorId}/variants`, body).then((d) => d.variant),
  updateVariant: (id, body) => patch(`/variants/${id}`, body).then((d) => d.variant),
  deleteVariant: (id) => del(`/variants/${id}`),

  uploadMedia: (productId, files, { colorId, onProgress } = {}) => {
    const form = new FormData()
    for (const f of files) form.append('files', f)
    if (colorId) form.append('colorId', colorId)
    return http
      .post(`/products/${productId}/media`, form, {
        onUploadProgress: (e) => onProgress?.(e.total ? e.loaded / e.total : 0),
      })
      .then((r) => r.data.media)
  },
  updateMedia: (id, body) => patch(`/media/${id}`, body).then((d) => d.media),
  deleteMedia: (id) => del(`/media/${id}`),

  createCategory: (body) => post('/categories', body).then((d) => d.category),
  updateCategory: (id, body) => patch(`/categories/${id}`, body).then((d) => d.category),
  deleteCategory: (id) => del(`/categories/${id}`),
  createBrand: (body) => post('/brands', body).then((d) => d.brand),
  updateBrand: (id, body) => patch(`/brands/${id}`, body).then((d) => d.brand),
  deleteBrand: (id) => del(`/brands/${id}`),
}

export const api = {
  // Catalogue
  categories: () => get('/categories').then((d) => d.categories),
  brands: () => get('/brands').then((d) => d.brands),
  products: (params) => get('/products', params),
  product: (slug) => get(`/products/${encodeURIComponent(slug)}`).then((d) => d.product),

  // Checkout & orders
  checkoutConfig: () => get('/checkout/config'),
  startCheckout: (items) => post('/checkout', { items }), // → { url, orderNumber }
  checkoutSession: (sessionId) => get(`/checkout/session/${encodeURIComponent(sessionId)}`).then((d) => d.order),
  myOrders: () => get('/orders/mine').then((d) => d.orders),

  // Auth
  me: () => get('/auth/me').then((d) => d.user),
  login: (body) => post('/auth/login', body).then((d) => d.user),
  register: (body) => post('/auth/register', body).then((d) => d.user),
  logout: () => post('/auth/logout'),
}
