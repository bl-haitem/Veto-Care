import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, Clock, Calendar, CheckCircle, XCircle, Users, User } from 'lucide-react'
import { rdvStatusConfig } from '@/lib/constants'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

export default function VetDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [vet, setVet] = useState(null)
  const [todayRdv, setTodayRdv] = useState([])
  const [pendingRdv, setPendingRdv] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

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
      const today = new Date().toISOString().split('T')[0]

      const [todayRes, pendingRes, statsRes] = await Promise.all([
        supabase
          .from('rendez_vous')
          .select(`
            id, date_rdv, heure_rdv, motif, status,
            profiles!rendez_vous_maitre_id_fkey ( full_name, phone, avatar_url )
          `)
          .eq('veterinaire_id', vetData.id)
          .eq('date_rdv', today)
          .order('heure_rdv', { ascending: true }),
        supabase
          .from('rendez_vous')
          .select(`
            id, date_rdv, heure_rdv, motif, created_at,
            profiles!rendez_vous_maitre_id_fkey ( full_name, phone )
          `)
          .eq('veterinaire_id', vetData.id)
          .eq('status', 'en_attente')
          .order('date_rdv', { ascending: true }),
        supabase
          .from('rendez_vous')
          .select('status')
          .eq('veterinaire_id', vetData.id),
      ])

      setTodayRdv(todayRes.data || [])
      setPendingRdv(pendingRes.data || [])

      const all = statsRes.data || []
      setStats({
        total: all.length,
        confirme: all.filter(r => r.status === 'confirme').length,
        termine: all.filter(r => r.status === 'termine').length,
        annule: all.filter(r => r.status === 'annule').length,
      })

      setLoading(false)
    }
    fetchData()
  }, [user, navigate])

  const handleAction = async (id, action, maitreId) => {
    setActionLoading(id)
    try {
      const newStatus = action === 'confirm' ? 'confirme' : 'annule'
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
        toast.success('Rendez-vous confirmé')
      } else {
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading">Tableau de bord</h1>
            <p className="text-gray-500 mt-1">
              {format(new Date(), 'EEEE dd MMMM yyyy', { locale: fr })}
            </p>
          </div>
          {vet?.avg_rating && (
            <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-yellow-700">{parseFloat(vet.avg_rating).toFixed(1)}</span>
              <span className="text-sm text-yellow-600">/ 5</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-4 text-center">
            <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-2">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold">{stats.confirme}</p>
            <p className="text-xs text-gray-500">Confirmés</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{stats.termine}</p>
            <p className="text-xs text-gray-500">Terminés</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-2xl font-bold">{stats.annule}</p>
            <p className="text-xs text-gray-500">Annulés</p>
          </Card>
        </div>

        {/* Pending Requests */}
        {pendingRdv.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold font-heading mb-3">Demandes en attente ({pendingRdv.length})</h2>
            <div className="space-y-3">
              {pendingRdv.map((rdv) => {
                const clientName = rdv.profiles?.full_name || 'Client'
                return (
                  <Card key={rdv.id} className="p-4 border-yellow-200 bg-yellow-50/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{clientName}</h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(rdv.date_rdv), 'dd MMM', { locale: fr })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {rdv.heure_rdv?.substring(0, 5)}
                            </span>
                          </div>
                          {rdv.motif && <p className="text-xs text-gray-400 mt-1">{rdv.motif}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 border-red-200 hover:bg-red-50 h-8"
                          onClick={() => handleAction(rdv.id, 'reject')}
                          disabled={actionLoading === rdv.id}
                        >
                          Refuser
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 h-8"
                          onClick={() => handleAction(rdv.id, 'confirm')}
                          disabled={actionLoading === rdv.id}
                        >
                          Confirmer
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Today's Schedule */}
        <div>
          <h2 className="text-lg font-semibold font-heading mb-3">Planning du jour</h2>
          {todayRdv.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Aucun rendez-vous aujourd&apos;hui</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {todayRdv.map((rdv) => {
                const clientName = rdv.profiles?.full_name || 'Client'
                return (
                  <Card key={rdv.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center w-16 shrink-0">
                        <p className="text-lg font-bold text-primary">{rdv.heure_rdv?.substring(0, 5)}</p>
                      </div>
                      <div className="w-px h-10 bg-gray-200" />
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={rdv.profiles?.avatar_url} />
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                          {clientName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">{clientName}</h3>
                        {rdv.profiles?.phone && (
                          <p className="text-xs text-gray-400">{rdv.profiles.phone}</p>
                        )}
                        {rdv.motif && <p className="text-xs text-gray-500 mt-0.5">{rdv.motif}</p>}
                      </div>
                      <Badge className={rdvStatusConfig[rdv.status]?.className}>
                        {rdvStatusConfig[rdv.status]?.label}
                      </Badge>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
