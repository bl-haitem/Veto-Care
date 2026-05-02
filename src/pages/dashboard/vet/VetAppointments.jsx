import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, Phone, Upload, CheckCircle, XCircle, FileText } from 'lucide-react'
import { rdvStatusConfig } from '@/lib/constants'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

export default function VetAppointments() {
  const { user } = useAuth()
  const [vet, setVet] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [notes, setNotes] = useState('')
  const [carnetFile, setCarnetFile] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      const { data: vetData } = await supabase
        .from('veterinaires')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!vetData) return
      setVet(vetData)

      const { data } = await supabase
        .from('rendez_vous')
        .select(`
          *,
          profiles!rendez_vous_maitre_id_fkey ( full_name, phone, avatar_url, wilaya )
        `)
        .eq('veterinaire_id', vetData.id)
        .order('date_rdv', { ascending: false })

      setAppointments(data || [])
      setLoading(false)
    }
    fetchData()
  }, [user])

  const handleAction = async (id, action, maitreId, date, heure) => {
    setActionLoading(id)
    try {
      let update = { status: 'termine' }

      if (action === 'confirm') {
        update = { status: 'confirme' }
      } else if (action === 'reject') {
        update = { status: 'annule' }
      } else if (action === 'complete') {
        update.status = 'termine'
        update.notes_vet = notes

        if (carnetFile) {
          const { data: upload, error: uploadError } = await supabase.storage
            .from('carnets')
            .upload(`${vet.id}/${id}`, carnetFile, { upsert: true })
          if (!uploadError) {
            update.carnet_url = upload.path
          }
        }
      }

      const { error } = await supabase
        .from('rendez_vous')
        .update(update)
        .eq('id', id)
        .eq('veterinaire_id', vet.id)

      if (error) throw error

      if (action === 'confirm' && maitreId) {
        await supabase.from('notifications').insert({
          user_id: maitreId,
          title: 'Rendez-vous confirmé',
          message: `Votre RDV du ${date} à ${heure} est confirmé`,
          read: false,
        })
      }

      setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...update } : a))
      toast.success(action === 'complete' ? 'Rendez-vous terminé' : action === 'confirm' ? 'Confirmé' : 'Refusé')
      setExpandedId(null)
      setNotes('')
      setCarnetFile(null)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setActionLoading(null)
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const upcoming = appointments.filter(a => a.date_rdv >= today && (a.status === 'en_attente' || a.status === 'confirme'))
  const past = appointments.filter(a => a.date_rdv < today || a.status === 'termine')
  const cancelled = appointments.filter(a => a.status === 'annule')

  const AppointmentCard = ({ rdv }) => {
    const clientName = rdv.profiles?.full_name || 'Client'
    const isExpanded = expandedId === rdv.id

    return (
      <Card key={rdv.id} className={`p-4 transition-all ${isExpanded ? 'ring-2 ring-primary/20' : ''}`}>
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : rdv.id)}>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={rdv.profiles?.avatar_url} />
              <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                {clientName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">{clientName}</h3>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(rdv.date_rdv), 'dd MMM yyyy', { locale: fr })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {rdv.heure_rdv?.substring(0, 5)}
                </span>
                {rdv.profiles?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {rdv.profiles.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Badge className={rdvStatusConfig[rdv.status]?.className}>
            {rdvStatusConfig[rdv.status]?.label}
          </Badge>
        </div>

        {rdv.motif && !isExpanded && (
          <p className="text-xs text-gray-400 mt-2 pl-14">Motif : {rdv.motif}</p>
        )}

        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-4">
            {rdv.motif && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Motif :</span> {rdv.motif}
              </p>
            )}

            {rdv.notes_vet && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Notes :</span> {rdv.notes_vet}
              </p>
            )}

            {rdv.status === 'en_attente' && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-500 border-red-200 hover:bg-red-50"
                  onClick={() => handleAction(rdv.id, 'reject', rdv.maitre_id)}
                  disabled={actionLoading === rdv.id}
                >
                  <XCircle className="h-4 w-4 mr-1" /> Refuser
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleAction(rdv.id, 'confirm', rdv.maitre_id, rdv.date_rdv, rdv.heure_rdv?.substring(0, 5))}
                  disabled={actionLoading === rdv.id}
                >
                  <CheckCircle className="h-4 w-4 mr-1" /> Confirmer
                </Button>
              </div>
            )}

            {(rdv.status === 'confirme' || rdv.status === 'en_attente') && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Terminer le rendez-vous
                </h4>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes du vétérinaire..."
                  rows={3}
                />
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-accent text-sm">
                    <Upload className="h-4 w-4" />
                    Carnet médical
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files[0]) setCarnetFile(e.target.files[0])
                      }}
                    />
                  </label>
                  {carnetFile && <span className="text-xs text-green-600">{carnetFile.name}</span>}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAction(rdv.id, 'complete', rdv.maitre_id, rdv.date_rdv, rdv.heure_rdv?.substring(0, 5))}
                  disabled={actionLoading === rdv.id}
                >
                  Marquer comme terminé
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Rendez-vous</h1>
          <p className="text-gray-500 mt-1">Gérez tous vos rendez-vous</p>
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
