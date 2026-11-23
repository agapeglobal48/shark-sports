import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import Product from './pages/Product.jsx'
import { Login, Register } from './pages/Auth.jsx'
import Account from './pages/Account.jsx'
import NotFound from './pages/NotFound.jsx'
import { CheckoutCancelled, CheckoutSuccess } from './pages/Checkout.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import Returns from './pages/Returns.jsx'
import Cookies from './pages/Cookies.jsx'
import Delivery from './pages/Delivery.jsx'
import Contact from './pages/Contact.jsx'
import KitDesigner from './pages/KitDesigner.jsx'
import { Care, ClubShop, PhotoWall, SizeGuide } from './pages/ComingSoon.jsx'

// The admin panel is only downloaded when an admin opens it.
const AdminLayout = lazy(() => import('./admin/AdminLayout.jsx'))
const Dashboard = lazy(() => import('./admin/Dashboard.jsx'))
const AdminProducts = lazy(() => import('./admin/Products.jsx'))
const ProductEditor = lazy(() => import('./admin/ProductEditor.jsx'))
const Taxonomy = lazy(() => import('./admin/Taxonomy.jsx'))
const AdminOrders = lazy(() => import('./admin/Orders.jsx'))
const AdminOrderDetail = lazy(() => import('./admin/Orders.jsx').then((m) => ({ default: m.OrderDetail })))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="shop/:category" element={<Shop />} />
        <Route path="product/:slug" element={<Product />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="account" element={<Account />} />
        <Route path="checkout/success" element={<CheckoutSuccess />} />
        <Route path="checkout/cancelled" element={<CheckoutCancelled />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="returns" element={<Returns />} />
        <Route path="cookies" element={<Cookies />} />
        <Route path="delivery" element={<Delivery />} />
        <Route path="contact" element={<Contact />} />
        <Route path="kit-designer" element={<KitDesigner />} />
        <Route path="club-shop" element={<ClubShop />} />
        <Route path="photo-wall" element={<PhotoWall />} />
        <Route path="size-guide" element={<SizeGuide />} />
        <Route path="care" element={<Care />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route
        path="admin"
        element={
          <Suspense fallback={<div className="min-h-screen bg-ink" />}>
            <AdminLayout />
          </Suspense>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<ProductEditor />} />
        <Route path="products/:id" element={<ProductEditor />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="categories" element={<Taxonomy />} />
      </Route>
    </Routes>
  )
}
