import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Calendar,
  Home,
  LogOut,
  PawPrint,
  Stethoscope,
  Settings,
  LayoutDashboard,
  Clock,
  Menu,
  ChevronRight
} from 'lucide-react'

export default function DashboardLayout({ children }) {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const isVet = profile?.role === 'veterinaire'

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth/login')
  }

  const ownerLinks = [
    { to: '/dashboard/owner', label: 'Accueil', icon: Home },
    { to: '/dashboard/owner/pets', label: 'Mes Animaux', icon: PawPrint },
    { to: '/dashboard/owner/appointments', label: 'Rendez-vous', icon: Calendar },
    { to: '/vets', label: 'Vétérinaires', icon: Stethoscope },
    { to: '/dashboard/owner/profile', label: 'Paramètres', icon: Settings },
  ]

  const vetLinks = [
    { to: '/dashboard/vet', label: 'Tableau de Bord', icon: LayoutDashboard },
    { to: '/dashboard/vet/appointments', label: 'Rendez-vous', icon: Clock },
    { to: '/dashboard/vet/patients', label: 'Patients', icon: PawPrint },
    { to: '/dashboard/vet/profile', label: 'Paramètres', icon: Settings },
  ]

  const links = isVet ? vetLinks : ownerLinks

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-lg">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
              >
                {isSidebarCollapsed ? <Menu className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>

              <Link to={isVet ? '/dashboard/vet' : '/dashboard/owner'} className="flex items-center gap-2.5 group">
                <div className="bg-teal-600 p-1.5 rounded-lg transition-transform group-hover:scale-105">
                  <PawPrint className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900 hidden sm:block">
                  Veto Care
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={isVet ? '/dashboard/vet/profile' : '/dashboard/owner/profile'}
                className="flex items-center gap-2.5 hover:bg-gray-50 rounded-full p-1 pr-3 transition-colors"
              >
                <Avatar className="h-8 w-8 border border-gray-200">
                  <AvatarFallback className="bg-teal-600 text-white text-xs font-semibold">
                    {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold leading-none text-gray-900">{profile?.full_name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 capitalize">{profile?.role === 'maitre' ? 'Propriétaire' : 'Vétérinaire'}</p>
                </div>
              </Link>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors text-gray-400"
                title="Déconnexion"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className={`shrink-0 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-16' : 'w-56'}`}>
            <nav className="flex flex-col gap-1 sticky top-24">
              {links.map((link) => {
                const Icon = link.icon
                const isActive = location.pathname === link.to
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`group flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 ${isSidebarCollapsed ? 'justify-center py-2.5 px-0' : 'py-2.5 px-3'} ${isActive
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900'
                    }`}
                    title={isSidebarCollapsed ? link.label : undefined}
                  >
                    <Icon className={`h-5 w-5 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    {!isSidebarCollapsed && <span>{link.label}</span>}
                  </Link>
                )
              })}

              <div className={`h-px bg-gray-200 my-2 ${isSidebarCollapsed ? 'mx-4' : 'mx-3'}`} />

              <button
                onClick={handleSignOut}
                className={`group flex items-center gap-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all ${isSidebarCollapsed ? 'justify-center py-2.5 px-0' : 'py-2.5 px-3'}`}
                title="Déconnexion"
              >
                <LogOut className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-red-500" />
                {!isSidebarCollapsed && <span>Déconnexion</span>}
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

