import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/context/useAuth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Star,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  ArrowUpRight,
  MoreVertical,
  Plus,
  PawPrint,
  AlertCircle
} from 'lucide-react'
import { rdvStatusConfig } from '@/lib/constants'
import StatusBadge from '@/components/ui/StatusBadge'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays, addWeeks, subWeeks } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { sendEmail, emailTemplates } from '@/lib/emailService'

export default function VetDashboard() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [vet, setVet] = useState(null)
  const [todayRdv, setTodayRdv] = useState([])
  const [pendingRdv, setPendingRdv] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      const { data: vetData } = await supabase
        .from('veterinaires')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!vetData) return

      if (vetData.status !== 'approved') {
        navigate('/auth/pending')
        return
      }

      setVet(vetData)

      const [todayRes, pendingRes, statsRes] = await Promise.all([
        supabase
          .from('rendez_vous')
          .select(`
            id, date_rdv, heure_rdv, motif, status,
            pet:pets!rendez_vous_pet_id_fkey(id, name, species, photo_url),
            profiles!rendez_vous_maitre_id_fkey ( full_name, phone )
          `)
          .eq('veterinaire_id', vetData.id)
          .eq('date_rdv', selectedDate)
          .order('heure_rdv', { ascending: true }),
        supabase
          .from('rendez_vous')
          .select(`
            id, maitre_id, date_rdv, heure_rdv, motif, created_at,
            pet:pets!rendez_vous_pet_id_fkey(id, name, species, photo_url),
            profiles!rendez_vous_maitre_id_fkey ( full_name, phone )
          `)
          .eq('veterinaire_id', vetData.id)
          .eq('status', 'pending')
          .order('date_rdv', { ascending: true }),
        supabase
          .from('rendez_vous')
          .select('status, maitre_id')
          .eq('veterinaire_id', vetData.id),
      ])

      setTodayRdv(todayRes.data || [])
      setPendingRdv(pendingRes.data || [])

      const all = statsRes.data || []
      setStats({
        total: all.length,
        confirmed: all.filter(r => r.status === 'confirmed').length,
        done: all.filter(r => r.status === 'done').length,
        cancelled: all.filter(r => r.status === 'cancelled').length,
        revenue: 0,
        pending: pendingRes.data?.length || 0,
        patients: new Set(all.map(r => r.maitre_id)).size || 0
      })

      setLoading(false)
    }
    fetchData()
  }, [user, navigate, selectedDate])

  const handleAction = async (id, action, maitreId) => {
    setActionLoading(id)
    try {
      const newStatus = action === 'confirm' ? 'confirmed' : 'cancelled'
      const { error } = await supabase
        .from('rendez_vous')
        .update({ status: newStatus })
        .eq('id', id)
        .eq('veterinaire_id', vet.id)

      if (error) throw error

      if (action === 'confirm') {
        await supabase.from('notifications').insert({
          user_id: maitreId,
          title: 'Rendez-vous confirmé',
          message: `Votre rendez-vous a été confirmé`,
          read: false,
        })

        const rdv = pendingRdv.find(r => r.id === id)
        if (rdv) {
          const { data: ownerProfile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', rdv.maitre_id)
            .single()

          if (ownerProfile?.email) {
            sendEmail(
              ownerProfile.email,
              'Rendez-vous confirmé - Veto-Care',
              emailTemplates.appointmentConfirmed({
                ownerName: ownerProfile.full_name || 'Client',
                vetName: profile?.full_name || 'Vétérinaire',
                date: rdv.date_rdv,
                time: rdv.heure_rdv?.substring(0, 5),
                petName: rdv.pet?.name,
              })
            )
          }
        }

        toast.success('Rendez-vous confirmé')
      } else {
        const rdv = pendingRdv.find(r => r.id === id)
        if (rdv) {
          const { data: ownerProfile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', rdv.maitre_id)
            .single()

          if (ownerProfile?.email) {
            sendEmail(
              ownerProfile.email,
              'Rendez-vous refusé - Veto-Care',
              emailTemplates.appointmentDeclined({
                ownerName: ownerProfile.full_name || 'Client',
                vetName: profile?.full_name || 'Vétérinaire',
                date: rdv.date_rdv,
                time: rdv.heure_rdv?.substring(0, 5),
                petName: rdv.pet?.name,
              })
            )
          }
        }
        toast.success('Rendez-vous refusé')
      }

      setTodayRdv(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
      setPendingRdv(prev => prev.filter(r => r.id !== id))
    } catch (error) {
      toast.error(error.message)
    } finally {
      setActionLoading(null)
    }
  }

  const metrics = [
    {
      label: `Rendez-vous (${format(new Date(selectedDate), 'dd/MM')})`,
      value: todayRdv.length,
      icon: Calendar,
      color: "text-[#14a38b]",
      bg: "bg-teal-50",
      trend: `${stats.confirmed || 0} confirmés en tout`,
      trendUp: true
    },
    {
      label: "Demandes en attente",
      value: stats.pending || 0,
      icon: Clock,
      color: "text-[#f59e0b]",
      bg: "bg-orange-50",
      trend: stats.pending > 0 ? "Urgent" : "Aucune",
      trendUp: false,
      badge: stats.pending > 0
    },
    {
      label: "Consultations terminées",
      value: stats.done || 0,
      icon: CheckCircle,
      color: "text-[#10b981]",
      bg: "bg-emerald-50",
      trend: `${stats.total || 0} total`,
      trendUp: true
    },
    {
      label: "Patients uniques",
      value: stats.patients || 0,
      icon: PawPrint,
      color: "text-[#14a38b]",
      bg: "bg-teal-50",
      trend: `${stats.confirmed || 0} confirmés`,
      trendUp: true
    }
  ]

  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6)
  })

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-[500px] lg:col-span-2 rounded-2xl" />
            <Skeleton className="h-[500px] rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading text-gray-900">
              Bonjour, Dr. {profile?.full_name?.split(' ')[1] || profile?.full_name} 👋
            </h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(new Date(selectedDate), 'EEEE dd MMMM yyyy', { locale: fr })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl border-gray-200 font-semibold h-11"
              onClick={() => navigate('/dashboard/vet/appointments')}>
              Tous les RDV
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <Card key={i} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 ${m.bg} ${m.color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <m.icon className="h-6 w-6" />
                </div>
                <div className={`flex items-center text-xs font-bold ${m.trendUp ? 'text-emerald-600' : 'text-orange-600'} bg-gray-50 px-2 py-1 rounded-lg`}>
                  {m.trendUp ? <TrendingUp className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                  {m.trend}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{m.value}</h3>
              <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wider">{m.label}</p>
              {m.badge && <div className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full m-4 animate-pulse" />}
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold font-heading text-gray-900">Planning</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <button
                  onClick={() => setWeekStart(subWeeks(weekStart, 1))}
                  className="text-xs md:text-sm font-semibold text-gray-500 hover:text-teal-600"
                >
                  Précédent
                </button>
                <button
                  onClick={() => {
                    const today = new Date()
                    setSelectedDate(format(today, 'yyyy-MM-dd'))
                    setWeekStart(startOfWeek(today, { weekStartsOn: 1 }))
                  }}
                  className="text-xs md:text-sm font-semibold text-teal-600 hover:underline"
                >
                  Aujourd'hui
                </button>
                <button
                  onClick={() => setWeekStart(addWeeks(weekStart, 1))}
                  className="text-xs md:text-sm font-semibold text-gray-500 hover:text-teal-600"
                >
                  Suivant
                </button>
              </div>
            </div>

            <Card className="p-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 md:p-6 border-b border-gray-50 bg-gray-50/30">
                <div className="flex gap-2 md:gap-4 overflow-x-auto pb-4 custom-scrollbar scrollbar-hide">
                  {weekDays.map((day, i) => {
                    const dateStr = format(day, 'yyyy-MM-dd')
                    const isSelected = selectedDate === dateStr
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`flex flex-col items-center min-w-[56px] md:min-w-[60px] py-2 md:py-3 px-2 rounded-2xl transition-all cursor-pointer ${isSelected ? 'bg-teal-600 text-white shadow-lg shadow-teal-100' : 'bg-white hover:bg-teal-50 border border-gray-100'}`}
                      >
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-teal-100' : 'text-gray-400'}`}>
                          {format(day, 'EEE', { locale: fr })}
                        </span>
                        <span className="text-base md:text-lg font-bold mt-1">{format(day, 'd')}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="p-6">
                {todayRdv.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-10 w-10 text-gray-200" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Pas de rendez-vous pour cette date</h3>
                    <p className="text-gray-500 mt-1">Choisissez un autre jour pour voir votre planning annuel.</p>
                  </div>
                ) : (
                  <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                    {todayRdv.map((rdv) => (
                      <div key={rdv.id} className="flex gap-6 relative group">
                        <div className={`w-10 h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center shrink-0 z-10 ${rdv.status === 'done' ? 'bg-teal-600' : 'bg-white'}`}>
                          <div className={`w-3 h-3 rounded-full ${rdv.status === 'confirmed' ? 'bg-teal-600 animate-pulse' : rdv.status === 'done' ? 'bg-white' : 'bg-gray-300'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-teal-600 w-12">{rdv.heure_rdv?.substring(0, 5)}</span>
                              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                <AvatarImage src={undefined} />
                                <AvatarFallback className="bg-gray-100 text-gray-600 font-bold">
                                  {rdv.profiles?.full_name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-bold text-gray-900">{rdv.profiles?.full_name}</h4>
                                <p className="text-xs text-gray-500 truncate">
                                  {rdv.pet && <span className="font-medium text-primary mr-1">🐾 {rdv.pet.name}</span>}
                                  {rdv.motif || 'Consultation générale'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <StatusBadge status={rdv.status === 'confirmed' ? 'confirme' : rdv.status === 'cancelled' ? 'annule' : rdv.status === 'done' ? 'termine' : 'en_attente'} />
                              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
                                <MoreVertical className="h-4 w-4 text-gray-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar Area: Pending & Messages */}
          <div className="space-y-8">
            {/* Pending Requests */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-heading text-gray-900">Demandes ({pendingRdv.length})</h2>
                <button
                  onClick={() => navigate('/dashboard/vet/appointments')}
                  className="text-xs font-bold text-yellow-600 hover:underline"
                >
                  Gérer tout
                </button>
              </div>

              <div className="space-y-4">
                {pendingRdv.length === 0 ? (
                  <Card className="p-6 text-center bg-white border-dashed border-2 border-gray-100 rounded-2xl shadow-sm">
                    <p className="text-sm text-gray-400 font-medium">Aucune nouvelle demande</p>
                  </Card>
                ) : (
                  pendingRdv.map((rdv) => (
                    <Card key={rdv.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">{rdv.profiles?.full_name}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-wider">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(rdv.date_rdv), 'dd MMM')} • {rdv.heure_rdv?.substring(0, 5)}
                          </div>
                          <p className="text-xs text-gray-600 mt-2 line-clamp-1 italic">
                            {rdv.pet && <span className="font-semibold text-primary mr-1 text-normal not-italic">🐾 {rdv.pet.name} -</span>}
                            "{rdv.motif}"
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleAction(rdv.id, 'confirm', rdv.maitre_id)}
                            className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-all shadow-sm"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleAction(rdv.id, 'reject', rdv.maitre_id)}
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </section>

            {/* Recent Activity / Tips */}
            <Card className="p-6 bg-gradient-to-br from-teal-700 to-teal-600 text-white rounded-2xl relative overflow-hidden shadow-xl shadow-teal-100 border-0">
              <div className="relative z-10">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <Users className="h-5 w-5 text-teal-100" />
                </div>
                <h3 className="font-bold text-lg leading-tight">Développez votre patientèle</h3>
                <p className="text-teal-50 text-xs mt-2 leading-relaxed opacity-80">
                  Améliorez votre profil et consultez les avis de vos clients pour attirer plus de propriétaires d'animaux sur Veto-Care.
                </p>
                <Button variant="ghost" className="mt-4 text-white hover:bg-white/10 p-0 h-auto text-xs font-bold flex items-center gap-1"
                  onClick={() => navigate('/dashboard/vet/profile')}>
                  Voir mon profil <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
              <Star className="absolute right-0 bottom-0 h-24 w-24 text-white/5 -mr-4 -mb-4 rotate-12" />
            </Card>

          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate('/dashboard/vet/appointments')}
        className="fixed bottom-8 right-8 w-14 h-14 bg-teal-600 text-white rounded-2xl shadow-2xl shadow-teal-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group">
        <Plus className="h-7 w-7 transition-transform group-hover:rotate-90" />
      </button>
    </DashboardLayout>
  )
}

