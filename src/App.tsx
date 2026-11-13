import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { supabase } from './lib/supabase'
import { applyAppearance } from './lib/theme'
import type { AppearanceSettings } from './lib/theme'

import Home from './pages/Home'
import Websites from './pages/Websites'
import WebsiteDetails from './pages/WebsiteDetails'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/NotFound'
import AccountDashboard from './pages/account/AccountDashboard'
import AccountSettings from './pages/account/AccountSettings'

import AdminLayout from './pages/admin/AdminLayout'
import Overview from './pages/admin/Overview'
import ManageWebsites from './pages/admin/ManageWebsites'
import AddWebsite from './pages/admin/AddWebsite'
import Categories from './pages/admin/Categories'
import Users from './pages/admin/Users'
import Roles from './pages/admin/Roles'
import Analytics from './pages/admin/Analytics'
import Reports from './pages/admin/Reports'
import Appearance from './pages/admin/Appearance'
import GeneralSettings from './pages/admin/GeneralSettings'
import ActivityLogs from './pages/admin/ActivityLogs'

function Layout() {
  return (
    <div className="min-h-screen bg-surface text-white font-body flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  useEffect(() => {
    supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'appearance')
      .single()
      .then(({ data }) => {
        if (data?.value) applyAppearance(data.value as AppearanceSettings)
      })

    supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'general')
      .single()
      .then(({ data }) => {
        const siteName = (data?.value as { siteName?: string } | null)?.siteName
        if (siteName) document.title = siteName
      })
  }, [])

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/websites" element={<Websites />} />
            <Route path="/websites/:slug" element={<WebsiteDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route
              path="/account"
              element={<ProtectedRoute><AccountDashboard /></ProtectedRoute>}
            />
            <Route
              path="/account/settings"
              element={<ProtectedRoute><AccountSettings /></ProtectedRoute>}
            />

            <Route
              path="/admin"
              element={<ProtectedRoute minRole="administrator"><AdminLayout /></ProtectedRoute>}
            >
              <Route index element={<Overview />} />
              <Route path="websites" element={<ManageWebsites />} />
              <Route path="websites/new" element={<AddWebsite />} />
              <Route path="websites/:id/edit" element={<AddWebsite />} />
              <Route path="categories" element={<ProtectedRoute minRole="admin"><Categories /></ProtectedRoute>} />
              <Route path="users" element={<ProtectedRoute minRole="admin"><Users /></ProtectedRoute>} />
              <Route path="roles" element={<ProtectedRoute minRole="owner"><Roles /></ProtectedRoute>} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="reports" element={<Reports />} />
              <Route path="appearance" element={<ProtectedRoute minRole="admin"><Appearance /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute minRole="owner"><GeneralSettings /></ProtectedRoute>} />
              <Route path="logs" element={<ProtectedRoute minRole="admin"><ActivityLogs /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
