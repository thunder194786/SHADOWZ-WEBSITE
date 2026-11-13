import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { hasRole } from '../lib/types'
import type { UserRole } from '../lib/types'
import AccessDenied from '../pages/AccessDenied'

export default function ProtectedRoute({
  children,
  minRole,
}: {
  children: ReactNode
  minRole?: UserRole
}) {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-400">
        Loading...
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (minRole && !hasRole(profile?.role, minRole)) {
    return <AccessDenied />
  }

  return <>{children}</>
}
