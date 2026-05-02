import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Star, Clock, CalendarDays, FileText, ArrowLeft } from 'lucide-react'
import { TIME_SLOTS } from '@/lib/constants'
import { format, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

export default function VetBookingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [vet, setVet] = useState(null)
  const [takenSlots, setTakenSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [motif, setMotif] = useState('')
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    const fetchVet = async () => {
      const { data } = await supabase
        .from('veterinaires')
        .select(`
          *, profiles!veterinaires_user_id_fkey ( full_name, wilaya )
        `)
        .eq('id', id)
        .single()
      setVet(data)
      setLoading(false)
    }
    fetchVet()
  }, [id])

  useEffect(() => {
    if (!selectedDate || !id) return
    const fetchTaken = async () => {
      const { data } = await supabase
        .from('rendez_vous')
        .select('date_rdv, heure_rdv')
        .eq('veterinaire_id', id)
        .in('status', ['en_attente', 'confirme'])
        .eq('date_rdv', selectedDate)
      setTakenSlots(data?.map(r => r.heure_rdv?.substring(0, 5)) || [])
    }
    fetchTaken()
  }, [selectedDate, id])

  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i))

  const isSlotTaken = (slot) => takenSlots.includes(slot)

  const handleBook = async () => {
    if (!selectedDate || !selectedTime || !motif.trim()) {
      toast.error('Veuillez remplir tous les champs')
      return
    }
    setBooking(true)
    try {
      const timeWithSeconds = `${selectedTime}:00`

      const { error } = await supabase
        .from('rendez_vous')
        .insert({
          maitre_id: user.id,
          veterinaire_id: id,
          date_rdv: selectedDate,
          heure_rdv: timeWithSeconds,
          motif: motif.trim(),
          status: 'en_attente',
        })

      if (error) throw error

      await supabase.from('notifications').insert({
        user_id: vet.user_id,
        title: 'Nouvelle demande de rendez-vous',
        message: `${profile?.full_name} demande un RDV le ${selectedDate} à ${selectedTime}`,
        read: false,
      })

      toast.success('Demande de rendez-vous envoyée !')
      navigate('/dashboard/owner/appointments')
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la réservation')
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </DashboardLayout>
    )
  }

  if (!vet) {
    return (
      <DashboardLayout>
        <Card className="p-8 text-center">
          <p className="text-gray-500">Vétérinaire introuvable</p>
          <Button onClick={() => navigate('/vets')} className="mt-4">Retour à la liste</Button>
        </Card>
      </DashboardLayout>
    )
  }

  const vetName = vet.profiles?.full_name || 'Vétérinaire'
  const avatarUrl = vet.photo_url
    ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${vet.photo_url}`
    : null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <button onClick={() => navigate('/vets')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Retour à la liste
        </button>

        {/* Vet Profile */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 shrink-0 mx-auto sm:mx-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={vetName} className="h-full w-full object-cover" onError={(e) => e.target.style.display = 'none'} />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-primary">
                  {vetName.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold font-heading">{vetName}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{vet.profiles?.wilaya}</span>
                {vet.adresse && <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{vet.adresse}</span>}
                {vet.avg_rating && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {parseFloat(vet.avg_rating).toFixed(1)}
                  </span>
                )}
              </div>
              {vet.bio && <p className="text-sm text-gray-600 mt-3">{vet.bio}</p>}
            </div>
          </div>
        </Card>

        {/* Booking */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold font-heading mb-4">Prendre rendez-vous</h2>

          {/* Date Selection */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <CalendarDays className="h-4 w-4" /> Date
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {next7Days.map((day) => {
                const formatted = format(day, 'yyyy-MM-dd')
                const isSelected = selectedDate === formatted
                return (
                  <button
                    key={formatted}
                    onClick={() => { setSelectedDate(formatted); setSelectedTime(null) }}
                    className={`flex flex-col items-center p-3 rounded-xl min-w-[64px] transition-colors ${
                      isSelected
                        ? 'bg-primary text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="text-xs">{format(day, 'EEE', { locale: fr })}</span>
                    <span className="text-lg font-bold">{format(day, 'dd')}</span>
                    <span className="text-xs">{format(day, 'MMM', { locale: fr })}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Clock className="h-4 w-4" /> Heure
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const taken = isSlotTaken(slot)
                  const isSelected = selectedTime === slot
                  return (
                    <button
                      key={slot}
                      disabled={taken}
                      onClick={() => setSelectedTime(slot)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        taken
                          ? 'bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                          : isSelected
                            ? 'bg-primary text-white'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {slot}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Motif */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <FileText className="h-4 w-4" /> Motif
            </label>
            <Textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Décrivez la raison de votre visite..."
              rows={3}
            />
          </div>

          <Button
            onClick={handleBook}
            className="w-full"
            disabled={!selectedDate || !selectedTime || !motif.trim() || booking}
          >
            {booking ? 'Envoi en cours...' : 'Confirmer la demande'}
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  )
}
