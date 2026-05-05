import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/context/useAuth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, Star, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import RdvForm from '@/components/rdv/RdvForm'
import { sendEmail, emailTemplates } from '@/lib/emailService'

export default function VetBookingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [vet, setVet] = useState(null)
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const [vetRes, petsRes] = await Promise.all([
        supabase
          .from('veterinaires')
          .select(`
            *, 
            profiles:profiles!veterinaires_user_id_fkey ( full_name, wilaya, email )
          `)
          .eq('id', id)
          .single(),
        user ? supabase.from('pets').select('*').eq('owner_id', user.id) : { data: null }
      ])

      setVet(vetRes.data)
      setPets(petsRes.data || [])
      setLoading(false)
    }
    if (id) fetchData()
  }, [id, user])

  const handleBooking = async (formData) => {
    const { selectedDate, selectedTime, motif, petId } = formData
    setBooking(true)
    try {
      const timeWithSeconds = `${selectedTime}:00`

      const { data: rdvData, error } = await supabase
        .from('rendez_vous')
        .insert({
          maitre_id: user.id,
          veterinaire_id: id,
          date_rdv: selectedDate,
          heure_rdv: timeWithSeconds,
          motif: motif.trim(),
          status: 'pending',
          pet_id: petId,
        })
        .select()
        .single()

      if (error) throw error

      // Non-blocking notification
      supabase.from('notifications').insert({
        user_id: vet.user_id,
        title: 'Nouvelle demande de rendez-vous',
        message: `${profile?.full_name} demande un RDV le ${selectedDate} à ${selectedTime}`,
        read: false,
      })

      // We get the email from the vet's profile which we synced in the DB
      const vetEmail = vet.profiles?.email
      
      const pet = pets.find(p => p.id === petId)
      const vetName = vet.profiles?.full_name || 'Vétérinaire'
      const ownerName = profile?.full_name || 'Client'

      console.log('Attempting to send emails...', { 
        ownerEmail: user.email, 
        vetEmail: vetEmail
      })

      const emailPromises = []

      if (user.email) {
        emailPromises.push(
          sendEmail(
            user.email,
            'Rendez-vous en attente - Veto Care',
            emailTemplates.appointmentPendingOwner({
              ownerName,
              vetName,
              date: selectedDate,
              time: selectedTime,
              motif: motif.trim(),
              petName: pet?.name,
            })
          ).then(res => ({ type: 'owner', ...res }))
        )
      }

      if (vetEmail) {
        emailPromises.push(
          sendEmail(
            vetEmail,
            'Nouvelle demande de rendez-vous - Veto Care',
            emailTemplates.appointmentCreatedVet({
              ownerName,
              vetName,
              date: selectedDate,
              time: selectedTime,
              motif: motif.trim(),
              petName: pet?.name,
            })
          ).then(res => ({ type: 'vet', ...res }))
        )
      } else {
        console.warn('Vet email not found in fetched vet data, skipping vet notification email')
      }

      if (emailPromises.length > 0) {
        const results = await Promise.allSettled(emailPromises)
        console.log('Email sending results:', results)
        results.forEach((result, idx) => {
          if (result.status === 'rejected') {
            console.error(`Email ${idx} failed to send:`, result.reason)
          } else if (!result.value.success) {
            console.error(`Email ${result.value.type} failed:`, result.value.error)
          } else {
            console.log(`Email ${result.value.type} sent successfully`)
          }
        })
      }

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
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </DashboardLayout>
    )
  }

  if (!vet) {
    return (
      <DashboardLayout>
        <Card className="p-8 text-center rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500">Vétérinaire introuvable</p>
          <Button onClick={() => navigate('/vets')} className="mt-4 rounded-xl bg-teal-600 hover:bg-teal-700">Retour à la liste</Button>
        </Card>
      </DashboardLayout>
    )
  }

  const vetName = vet.profiles?.full_name || 'Vétérinaire'
  const avatarUrl = null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <button onClick={() => navigate('/vets')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600">
          <ArrowLeft className="h-4 w-4" /> Retour à la liste
        </button>

        {/* Vet Profile */}
        <Card className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 shrink-0 mx-auto sm:mx-0 ring-2 ring-white shadow-sm">
              {avatarUrl ? (
                <img src={avatarUrl} alt={vetName} className="h-full w-full object-cover" onError={(e) => e.target.style.display = 'none'} />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-heading font-bold text-teal-700 bg-teal-100">
                  {vetName.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold font-heading text-gray-900">{vetName}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{vet.profiles?.wilaya}</span>
                {vet.adresse && <span>{vet.adresse}</span>}
                {vet.avg_rating && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {parseFloat(vet.avg_rating).toFixed(1)}
                  </span>
                )}
              </div>
              {vet.bio && <p className="text-sm text-gray-600 mt-3 leading-relaxed">{vet.bio}</p>}
            </div>
          </div>
        </Card>

        {/* Booking Form */}
        <RdvForm onSubmit={handleBooking} isLoading={booking} pets={pets} vetId={id} />
      </div>
    </DashboardLayout>
  )
}
