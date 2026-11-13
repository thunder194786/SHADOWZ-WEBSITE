import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { hasRole } from '../../lib/types'

const links = [
  { to: '/admin', label: 'Overview', end: true, min: 'administrator' as const },
  { to: '/admin/websites', label: 'Manage Websites', min: 'administrator' as const },
  { to: '/admin/websites/new', label: 'Add Website', min: 'administrator' as const },
  { to: '/admin/categories', label: 'Categories', min: 'admin' as const },
  { to: '/admin/users', label: 'Users', min: 'admin' as const },
  { to: '/admin/roles', label: 'Roles & Permissions', min: 'owner' as const },
  { to: '/admin/analytics', label: 'Analytics', min: 'administrator' as const },
  { to: '/admin/reports', label: 'Reports', min: 'moderator' as const },
  { to: '/admin/appearance', label: 'Appearance Settings', min: 'admin' as const },
  { to: '/admin/settings', label: 'General Settings', min: 'owner' as const },
  { to: '/admin/logs', label: 'Admin Activity Logs', min: 'admin' as const },
]

export default function Sidebar() {
  const { profile } = useAuth()

  return (
    <aside className="w-full md:w-64 shrink-0 border-r border-violet/20 md:min-h-[calc(100vh-4rem)] p-4">
      <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible">
        {links
          .filter((l) => hasRole(profile?.role, l.min))
          .map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-neon/15 text-neon border border-neon/40'
                    : 'text-gray-300 hover:bg-violet/10 border border-transparent'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
      </nav>
    </aside>
  )
}
