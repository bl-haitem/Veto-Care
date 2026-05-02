import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, MapPin, X } from 'lucide-react'
import { rdvStatusConfig } from '@/lib/constants'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

export default function OwnerAppointments() {
  const { user, profile } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    if (!user) return
    const fetchAppointments = async () => {
      const { data } = await supabase
        .from('rendez_vous')
        .select(`
          *,
          veterinaires (
            user_id, wilaya, adresse, photo_url,
            profiles!veterinaires_user_id_fkey ( full_name )
          )
        `)
        .eq('maitre_id', user.id)
        .order('date_rdv', { ascending: false })

      setAppointments(data || [])
      setLoading(false)
    }
    fetchAppointments()
  }, [user])

  const getVetName = (rdv) => rdv.veterinaires?.profiles?.full_name || 'Vétérinaire'

  const cancelAppointment = async (rdvId, vetUserId) => {
    setCancelling(rdvId)
    try {
      const { error } = await supabase
        .from('rendez_vous')
        .update({ status: 'annule' })
        .eq('id', rdvId)
        .eq('maitre_id', user.id)

      if (error) throw error

      setAppointments(prev => prev.map(a => a.id === rdvId ? { ...a, status: 'annule' } : a))

      if (vetUserId) {
        await supabase.from('notifications').insert({
          user_id: vetUserId,
          title: 'Rendez-vous annulé',
          message: `${profile?.full_name} a annulé le rendez-vous`,
          read: false,
        })
      }

      toast.success('Rendez-vous annulé')
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'annulation")
    } finally {
      setCancelling(null)
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const upcoming = appointments.filter(a => a.date_rdv >= today && (a.status === 'en_attente' || a.status === 'confirme'))
  const past = appointments.filter(a => a.date_rdv < today || a.status === 'termine')
  const cancelled = appointments.filter(a => a.status === 'annule')

  const AppointmentCard = ({ rdv }) => (
    <Card key={rdv.id} className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-primary font-bold shrink-0">
            {getVetName(rdv).charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{getVetName(rdv)}</h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(rdv.date_rdv), 'dd MMM yyyy', { locale: fr })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {rdv.heure_rdv?.substring(0, 5)}
              </span>
              {rdv.veterinaires?.wilaya && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {rdv.veterinaires.wilaya}
                </span>
              )}
            </div>
            {rdv.motif && <p className="text-xs text-gray-400 mt-1">Motif : {rdv.motif}</p>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge className={rdvStatusConfig[rdv.status]?.className}>
            {rdvStatusConfig[rdv.status]?.label}
          </Badge>
          {(rdv.status === 'en_attente' || rdv.status === 'confirme') && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-red-500 hover:text-red-600 hover:bg-red-50 p-0 px-2"
              onClick={() => cancelAppointment(rdv.id, rdv.veterinaires?.user_id)}
              disabled={cancelling === rdv.id}
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Annuler
            </Button>
          )}
        </div>
      </div>
    </Card>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">Mes rendez-vous</h1>
            <p className="text-gray-500 mt-1">Historique et gestion de vos rendez-vous</p>
          </div>
          <Link to="/vets">
            <Button size="sm">Nouveau RDV</Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <Tabs defaultValue="upcoming">
            <TabsList>
              <TabsTrigger value="upcoming">À venir ({upcoming.length})</TabsTrigger>
              <TabsTrigger value="past">Passés ({past.length})</TabsTrigger>
              <TabsTrigger value="cancelled">Annulés ({cancelled.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-3 mt-4">
              {upcoming.length === 0 ? (
                <Card className="p-8 text-center">
                  <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Aucun rendez-vous à venir</p>
                  <Link to="/vets">
                    <Button className="mt-4" size="sm">Prendre un rendez-vous</Button>
                  </Link>
                </Card>
              ) : (
                upcoming.map(rdv => <AppointmentCard key={rdv.id} rdv={rdv} />)
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-3 mt-4">
              {past.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-500 font-medium">Aucun rendez-vous passé</p>
                </Card>
              ) : (
                past.map(rdv => <AppointmentCard key={rdv.id} rdv={rdv} />)
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-3 mt-4">
              {cancelled.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-500 font-medium">Aucun rendez-vous annulé</p>
                </Card>
              ) : (
                cancelled.map(rdv => <AppointmentCard key={rdv.id} rdv={rdv} />)
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  )
}
