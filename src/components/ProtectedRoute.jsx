import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'

export default function ProtectedRoute({ children, allowedRoles, redirectTo }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  if (allowedRoles && profile?.role && !allowedRoles.includes(profile.role)) {
    return <Navigate to={redirectTo || '/'} replace />
  }

  return children
}
