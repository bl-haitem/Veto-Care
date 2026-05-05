import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/context/useAuth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import StatusBadge from '@/components/ui/StatusBadge'
import { Calendar, Clock, MapPin, Star, X, PawPrint } from 'lucide-react'
import { toast } from 'sonner'
import { rdvStatusConfig } from '@/lib/constants'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { sendEmail, emailTemplates } from '@/lib/emailService'

export default function OwnerAppointments() {
  const { user, profile } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)
  const [ratingRdv, setRatingRdv] = useState(null)
  const [hoverRating, setHoverRating] = useState(0)
  const [selectedRating, setSelectedRating] = useState(0)
  const [ratingLoading, setRatingLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchAppointments()
  }, [user])

  const fetchAppointments = async () => {
    const { data } = await supabase
      .from('rendez_vous')
      .select(`
        *,
        pet:pets!rendez_vous_pet_id_fkey(id, name, species, photo_url),
        veterinaires (
          id, user_id, wilaya, adresse, avg_rating,
          profiles!veterinaires_user_id_fkey ( full_name )
        )
      `)
      .eq('maitre_id', user.id)
      .order('date_rdv', { ascending: false })

    setAppointments(data || [])
    setLoading(false)
  }

  const cancelAppointment = async (rdvId) => {
    const rdv = appointments.find(a => a.id === rdvId)
    setCancelling(rdvId)
    try {
      const { error } = await supabase
        .from('rendez_vous')
        .update({ status: 'cancelled' })
        .eq('id', rdvId)
        .eq('maitre_id', user.id)

      if (error) throw error
      setAppointments(prev => prev.map(a => a.id === rdvId ? { ...a, status: 'cancelled' } : a))

      if (rdv?.veterinaires?.user_id) {
        await supabase.from('notifications').insert({
          user_id: rdv.veterinaires.user_id,
          title: 'Rendez-vous annulé',
          message: `${profile?.full_name} a annulé le rendez-vous du ${rdv.date_rdv}`,
          read: false,
        })

        const { data: vetProfile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', rdv.veterinaires.user_id)
          .single()

        if (vetProfile?.email) {
          console.log('Sending cancellation email to vet...', vetProfile.email)
          sendEmail(
            vetProfile.email,
            'Rendez-vous annule par le client - Veto Care',
            emailTemplates.appointmentCancelledByOwner({
              ownerName: profile?.full_name || 'Client',
              vetName: vetProfile.full_name || 'Vétérinaire',
              date: rdv.date_rdv,
              time: rdv.heure_rdv?.substring(0, 5),
              petName: rdv.pet?.name,
            })
          ).then(res => console.log('Vet cancellation email result:', res))
        } else {
          console.warn('Vet email missing for cancellation notification')
        }
      }
      toast.success('Rendez-vous annulé')
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'annulation")
    } finally {
      setCancelling(null)
    }
  }

  const submitRating = async () => {
    if (!selectedRating || !ratingRdv) return
    setRatingLoading(true)
    try {
      const vetId = ratingRdv.veterinaires?.id
      if (!vetId) throw new Error('Vétérinaire introuvable')

      // Call the RPC function to securely update the rating
      const { error } = await supabase.rpc('rate_veterinaire', {
        vet_id: vetId,
        new_rating: selectedRating
      })

      if (error) throw error

      toast.success('Merci pour votre évaluation !')
      setRatingRdv(null)
      setSelectedRating(0)
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'évaluation")
    } finally {
      setRatingLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const upcoming = appointments.filter(a => a.date_rdv >= today && (a.status === 'pending' || a.status === 'confirmed'))
  const past = appointments.filter(a => a.date_rdv < today || a.status === 'done')
  const cancelled = appointments.filter(a => a.status === 'cancelled')

  const RdvCard = ({ rdv }) => {
    const vetName = rdv.veterinaires?.profiles?.full_name || 'Vétérinaire'
    const statusConfig = rdvStatusConfig[rdv.status] || {}
    const canCancel = rdv.status === 'pending' || rdv.status === 'confirmed'
    const canRate = rdv.status === 'done'

    return (
      <Card className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 text-teal-600 font-black text-lg">
              Dr
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading font-semibold text-gray-900">Dr. {vetName}</h3>
                <StatusBadge status={rdv.status === 'confirmed' ? 'confirme' : rdv.status === 'cancelled' ? 'annule' : rdv.status === 'done' ? 'termine' : 'en_attente'} />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1.5">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(rdv.date_rdv), 'dd MMMM yyyy', { locale: fr })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {rdv.heure_rdv?.substring(0, 5)}
                </span>
                {rdv.veterinaires?.adresse && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {rdv.veterinaires.adresse}
                  </span>
                )}
              </div>
              {rdv.pet && (
                <div className="flex items-center gap-1 mt-1.5 text-xs font-medium text-teal-600">
                  <PawPrint className="h-3 w-3" />
                  {rdv.pet.name} · {rdv.pet.species}
                </div>
              )}
              {rdv.motif && (
                <p className="text-xs text-gray-500 mt-1.5 italic">"{rdv.motif}"</p>
              )}
              {rdv.notes_vet && (
                <div className="mt-2 p-2.5 bg-blue-50 rounded-xl text-xs text-blue-800">
                  <span className="font-bold">Notes du vétérinaire : </span>{rdv.notes_vet}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            {canRate && (
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl border-amber-200 text-amber-600 hover:bg-amber-50 gap-1.5 font-semibold"
                onClick={() => { setRatingRdv(rdv); setSelectedRating(0); setHoverRating(0) }}
              >
                <Star className="h-4 w-4" />
                Évaluer
              </Button>
            )}
            {canCancel && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => cancelAppointment(rdv.id)}
                disabled={cancelling === rdv.id}
                className="rounded-xl text-red-500 border-red-200 hover:bg-red-50 gap-1.5 font-semibold"
              >
                <X className="h-4 w-4" />
                {cancelling === rdv.id ? '...' : 'Annuler'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    )
  }

  const EmptyState = ({ message }) => (
    <Card className="p-10 text-center border-dashed border-2 border-gray-100 rounded-2xl bg-white shadow-sm">
      <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500 font-medium">{message}</p>
    </Card>
  )

  return (
    <>
      <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Mes rendez-vous</h1>
          <p className="text-gray-600 mt-1">Historique et gestion de vos rendez-vous</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 w-full rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <Tabs defaultValue="upcoming" className="space-y-4">
            <TabsList className="bg-white border border-gray-100 rounded-xl p-1">
              <TabsTrigger value="upcoming">À venir ({upcoming.length})</TabsTrigger>
              <TabsTrigger value="past">Passés ({past.length})</TabsTrigger>
              <TabsTrigger value="cancelled">Annulés ({cancelled.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-4 space-y-3">
              {upcoming.length === 0
                ? <EmptyState message="Aucun rendez-vous à venir" />
                : upcoming.map(rdv => <RdvCard key={rdv.id} rdv={rdv} />)
              }
            </TabsContent>

            <TabsContent value="past" className="mt-4 space-y-3">
              {past.length === 0
                ? <EmptyState message="Aucun rendez-vous passé" />
                : past.map(rdv => <RdvCard key={rdv.id} rdv={rdv} />)
              }
            </TabsContent>

            <TabsContent value="cancelled" className="mt-4 space-y-3">
              {cancelled.length === 0
                ? <EmptyState message="Aucun rendez-vous annulé" />
                : cancelled.map(rdv => <RdvCard key={rdv.id} rdv={rdv} />)
              }
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Rating Dialog */}
      <Dialog open={!!ratingRdv} onOpenChange={() => { setRatingRdv(null); setSelectedRating(0) }}>
        <DialogContent className="max-w-sm rounded-2xl text-center border border-gray-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black font-heading">
              Évaluer Dr. {ratingRdv?.veterinaires?.profiles?.full_name}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Formulaire d'évaluation du médecin vétérinaire.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-500 text-sm mb-6">Comment s'est passée votre consultation ?</p>
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setSelectedRating(star)}
                  className="transition-transform hover:scale-125 active:scale-110"
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${star <= (hoverRating || selectedRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-200'
                      }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-500 mb-6 h-5">
              {selectedRating === 1 && '😞 Très décevant'}
              {selectedRating === 2 && '😐 Peut mieux faire'}
              {selectedRating === 3 && '🙂 Correct'}
              {selectedRating === 4 && '😊 Très bien'}
              {selectedRating === 5 && '🌟 Excellent !'}
            </div>
            <Button
              onClick={submitRating}
              disabled={!selectedRating || ratingLoading}
              className="w-full h-12 font-bold rounded-2xl"
            >
              {ratingLoading ? 'Envoi...' : 'Envoyer mon évaluation'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </DashboardLayout>
    </>
  )
}
