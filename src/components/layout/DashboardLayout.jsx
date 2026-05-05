import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import NotificationBell from './NotificationBell'
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
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react'

export default function DashboardLayout({ children }) {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  
  const isVet = profile?.role === 'veterinaire'

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false)
  }, [location.pathname])

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-lg">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Desktop Collapse Toggle */}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
              >
                {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </button>

              <Link to={isVet ? '/dashboard/vet' : '/dashboard/owner'} className="flex items-center gap-2.5 group">
                <div className="bg-teal-600 p-1.5 rounded-lg transition-transform group-hover:scale-105">
                  <PawPrint className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">
                  Veto Care
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <NotificationBell />
              
              <Link
                to={isVet ? '/dashboard/vet/profile' : '/dashboard/owner/profile'}
                className="flex items-center gap-2.5 hover:bg-gray-50 rounded-full p-1 md:pr-3 transition-colors"
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

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6 relative">
        {/* Sidebar Backdrop (Mobile) */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-0
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isSidebarCollapsed ? 'lg:w-16' : 'lg:w-56'}
        `}>
          {/* Mobile Sidebar Close Button */}
          <div className="flex items-center justify-between p-4 lg:hidden border-b border-gray-50">
            <span className="font-bold text-gray-900">Navigation</span>
            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className={`flex flex-col gap-1 p-4 lg:p-0 lg:sticky lg:top-24`}>
            {links.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`group flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 
                    ${isSidebarCollapsed ? 'lg:justify-center lg:py-2.5 lg:px-0' : 'py-2.5 px-3'} 
                    ${isActive
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                    }`}
                  title={isSidebarCollapsed ? link.label : undefined}
                >
                  <Icon className={`h-5 w-5 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-teal-600'}`} />
                  <span className={`${isSidebarCollapsed ? 'lg:hidden' : 'block'}`}>{link.label}</span>
                </Link>
              )
            })}

            <div className={`h-px bg-gray-100 my-4 ${isSidebarCollapsed ? 'lg:mx-4' : 'mx-3'}`} />

            <button
              onClick={handleSignOut}
              className={`group flex items-center gap-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all 
                ${isSidebarCollapsed ? 'lg:justify-center lg:py-2.5 lg:px-0' : 'py-2.5 px-3'}`}
            >
              <LogOut className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-red-500" />
              <span className={`${isSidebarCollapsed ? 'lg:hidden' : 'block'}`}>Déconnexion</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </main>
      </div>
    </div>
  )
}

