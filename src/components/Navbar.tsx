import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from './Button'
import Container from './Container'
import { useAuth } from '../context/AuthContext'
import { hasRole } from '../lib/types'

export default function Navbar() {
  const { session, profile, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-violet/20 bg-surface/80 backdrop-blur-lg">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="font-heading text-xl font-bold tracking-widest text-neon">
            SZ <span className="text-gray-300 font-normal text-sm tracking-normal">SHADOWZ HUB</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-300">
            <Link to="/" className="hover:text-neon transition-colors">Home</Link>
            <Link to="/websites" className="hover:text-neon transition-colors">Websites</Link>
            <Link to="/about" className="hover:text-neon transition-colors">About</Link>
            <Link to="/contact" className="hover:text-neon transition-colors">Contact</Link>
          </nav>

          {!session ? (
            <div className="flex items-center gap-3">
              <Link to="/login"><Button variant="outline">Login</Button></Link>
              <Link to="/signup"><Button variant="primary">Sign Up</Button></Link>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg border border-violet/40 px-4 py-2 text-sm text-gray-200 hover:border-neon transition-colors"
              >
                {profile?.username ?? 'Account'}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-violet/30 bg-surface2/95 backdrop-blur-xl shadow-lg overflow-hidden">
                  <Link
                    to="/account"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-sm text-gray-200 hover:bg-violet/10"
                  >
                    My Account
                  </Link>
                  <Link
                    to="/account/settings"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-sm text-gray-200 hover:bg-violet/10"
                  >
                    Account Settings
                  </Link>
                  {hasRole(profile?.role, 'administrator') && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3 text-sm text-neon hover:bg-violet/10"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-sm text-gray-400 hover:bg-violet/10"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </header>
  )
}
