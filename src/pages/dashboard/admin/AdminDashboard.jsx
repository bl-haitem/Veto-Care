import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Users, 
  Stethoscope, 
  PawPrint, 
  Calendar, 
  TrendingUp, 
  ShieldCheck,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVets: 0,
    totalAnimals: 0,
    totalAppointments: 0,
    pendingVets: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, vetsRes, animalsRes, appointmentsRes, pendingRes] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('veterinaires').select('*', { count: 'exact', head: true }),
          supabase.from('pets').select('*', { count: 'exact', head: true }),
          supabase.from('rendez_vous').select('*', { count: 'exact', head: true }),
          supabase.from('veterinaires').select('*', { count: 'exact', head: true }).eq('status', 'pending')
        ])

        setStats({
          totalUsers: usersRes.count || 0,
          totalVets: vetsRes.count || 0,
          totalAnimals: animalsRes.count || 0,
          totalAppointments: appointmentsRes.count || 0,
          pendingVets: pendingRes.count || 0
        })
      } catch (error) {
        console.error('Error fetching admin stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const StatCard = ({ title, value, icon: Icon, color, trend, label }) => (
    <Card className="p-6 border-none shadow-sm bg-white overflow-hidden relative group">
      <div className={`absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 transition-transform group-hover:scale-110 duration-500`}>
        <Icon size={80} />
      </div>
      <div className="flex items-center gap-4 relative z-10">
        <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            {trend && (
              <span className={`text-xs font-bold flex items-center ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(trend)}%
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">{label}</p>
        </div>
      </div>
    </Card>
  )

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Administration</h1>
          <p className="text-gray-500 mt-1">Vue d'ensemble du système et gestion globale</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Utilisateurs" 
                value={stats.totalUsers} 
                icon={Users} 
                color="bg-blue-600" 
                label="Inscrits au total"
              />
              <StatCard 
                title="Vétérinaires" 
                value={stats.totalVets} 
                icon={Stethoscope} 
                color="bg-teal-600" 
                label="Praticiens actifs"
              />
              <StatCard 
                title="Animaux" 
                value={stats.totalAnimals} 
                icon={PawPrint} 
                color="bg-orange-600" 
                label="Compagnons suivis"
              />
              <StatCard 
                title="Rendez-vous" 
                value={stats.totalAppointments} 
                icon={Calendar} 
                color="bg-purple-600" 
                label="Consultations"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Verification Alerts */}
              <Card className="lg:col-span-1 p-6 border-none shadow-sm bg-white">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Vérifications en attente
                </h3>
                <div className="text-center py-8">
                  {stats.pendingVets > 0 ? (
                    <div className="space-y-4">
                      <div className="h-20 w-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto">
                        <TrendingUp className="h-10 w-10 text-yellow-600" />
                      </div>
                      <p className="text-gray-600">
                        Il y a <span className="font-bold text-gray-900">{stats.pendingVets}</span> vétérinaires en attente de vérification.
                      </p>
                      <Button className="w-full" variant="outline">
                        Vérifier maintenant
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-gray-400">Tout est à jour !</p>
                      <p className="text-sm text-gray-300">Aucun nouveau vétérinaire en attente.</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* System Activity */}
              <Card className="lg:col-span-2 p-6 border-none shadow-sm bg-white">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Activité du système
                </h3>
                <div className="h-48 flex items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-400 text-sm italic">Graphiques d'activité (simulés)</p>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
