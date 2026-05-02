import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import NotificationBell from './NotificationBell'
import {
  Calendar,
  Home,
  LogOut,
  PawPrint,
  Stethoscope,
} from 'lucide-react'

export default function DashboardLayout({ children }) {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isVet = profile?.role === 'veterinaire'

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth/login')
  }

  const ownerLinks = [
    { to: '/dashboard/owner', label: 'Accueil', icon: Home },
    { to: '/dashboard/owner/appointments', label: 'Mes rendez-vous', icon: Calendar },
    { to: '/vets', label: 'Trouver un vétérinaire', icon: Stethoscope },
  ]

  const vetLinks = [
    { to: '/dashboard/vet', label: 'Accueil', icon: Home },
    { to: '/dashboard/vet/appointments', label: 'Rendez-vous', icon: Calendar },
  ]

  const links = isVet ? vetLinks : ownerLinks

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={isVet ? '/dashboard/vet' : '/dashboard/owner'} className="flex items-center gap-2">
              <PawPrint className="h-7 w-7 text-primary" />
              <span className="font-bold text-xl font-heading text-primary">Veto Care</span>
            </Link>

            <div className="flex items-center gap-3">
              <NotificationBell />
              <Link
                to={isVet ? '/dashboard/vet/profile' : '/dashboard/owner/profile'}
                className="flex items-center gap-2 hover:bg-accent rounded-full p-1 pr-3 transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-primary text-white text-xs">
                    {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block">{profile?.full_name}</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-full hover:bg-accent transition-colors text-muted-foreground"
                title="Déconnexion"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 shrink-0">
            <nav className="bg-white rounded-xl border border-gray-200 p-2 lg:sticky lg:top-20">
              {links.map((link) => {
                const Icon = link.icon
                const isActive = location.pathname === link.to
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-gray-700 hover:bg-accent'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </nav>
          </aside>

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  )
}
