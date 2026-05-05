import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/context/useAuth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, Phone, Upload, CheckCircle, XCircle, FileText } from 'lucide-react'
import { rdvStatusConfig } from '@/lib/constants'
import StatusBadge from '@/components/ui/StatusBadge'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { sendEmail, emailTemplates } from '@/lib/emailService'

function AppointmentCard({ rdv, expandedId, setExpandedId, localNotes, setLocalNotes, carnetFile, setCarnetFile, handleAction, actionLoading, handleStatusChange }) {
  const clientName = rdv.profiles?.full_name || 'Client'
  const isExpanded = expandedId === rdv.id

  return (
    <Card className={`p-4 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all ${isExpanded ? 'ring-2 ring-teal-200' : 'hover:shadow-md'}`}>
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : rdv.id)}>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-teal-50 text-teal-600 font-bold">
              {clientName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-heading font-semibold text-sm text-gray-900">{clientName}</h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-0.5">
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
              {rdv.pet && (
                <span className="text-teal-600 font-medium">
                  🐾 {rdv.pet.name} ({rdv.pet.species})
                </span>
              )}
            </div>
          </div>
        </div>
        <StatusBadge status={rdv.status === 'confirmed' ? 'confirme' : rdv.status === 'cancelled' ? 'annule' : rdv.status === 'done' ? 'termine' : 'en_attente'} />
      </div>

      {rdv.motif && !isExpanded && (
        <p className="text-xs text-gray-400 mt-2 pl-14">Motif : {rdv.motif}</p>
      )}

      {isExpanded && (
        <div className="mt-4 pt-4 border-t space-y-4">
          {rdv.motif && (
            <p className="text-sm text-gray-600"><span className="font-medium">Motif :</span> {rdv.motif}</p>
          )}
          {rdv.notes_vet && (
            <p className="text-sm text-gray-600"><span className="font-medium">Notes :</span> {rdv.notes_vet}</p>
          )}
          {rdv.carnet_url && (
            <a
              href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/pets/${rdv.carnet_url}`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs text-teal-600 font-semibold hover:underline"
            >
              <FileText className="h-4 w-4" /> Voir le carnet médical
            </a>
          )}

          {rdv.status === 'pending' && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 rounded-xl"
                onClick={() => handleAction(rdv.id, 'reject')} disabled={actionLoading === rdv.id}>
                <XCircle className="h-4 w-4 mr-1" /> Refuser
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 rounded-xl"
                onClick={() => handleAction(rdv.id, 'confirm')} disabled={actionLoading === rdv.id}>
                <CheckCircle className="h-4 w-4 mr-1" /> Confirmer
              </Button>
            </div>
          )}

          {(rdv.status === 'confirmed' || rdv.status === 'pending') && (
            <div className="space-y-3 border-t pt-4">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" /> Terminer la consultation
              </h4>
              <Textarea
                value={localNotes[rdv.id] || ''}
                onChange={(e) => setLocalNotes(prev => ({ ...prev, [rdv.id]: e.target.value }))}
                placeholder="Notes vétérinaires (diagnostic, traitement...)"
                rows={3}
              />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 text-sm">
                  <Upload className="h-4 w-4" /> Joindre carnet médical
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                    onChange={(e) => {
                      if (e.target.files[0]) setCarnetFile(prev => ({ ...prev, [rdv.id]: e.target.files[0] }))
                    }} />
                </label>
                {carnetFile[rdv.id] && <span className="text-xs text-green-600">{carnetFile[rdv.id].name}</span>}
              </div>
              <Button size="sm" className="rounded-xl bg-teal-600 hover:bg-teal-700" onClick={() => handleAction(rdv.id, 'complete')} disabled={actionLoading === rdv.id}>
                {actionLoading === rdv.id ? 'En cours...' : 'Marquer comme terminé'}
              </Button>
            </div>
          )}

          <div className="flex items-center gap-3 border-t pt-4 mt-4">
            <span className="text-sm font-medium text-gray-600">Changer le statut :</span>
            <Select value={rdv.status} onValueChange={(val) => handleStatusChange(rdv.id, val)} disabled={actionLoading === rdv.id}>
              <SelectTrigger className="w-[180px] h-9 rounded-xl border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="confirmed">Confirmé</SelectItem>
                <SelectItem value="done">Terminé</SelectItem>
                <SelectItem value="cancelled">Annulé / Refusé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </Card>
  )
}

export default function VetAppointments() {
  const { user, profile } = useAuth()
  const [vet, setVet] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [notes, setNotes] = useState({})
  const [localNotes, setLocalNotes] = useState({})
  const [carnetFile, setCarnetFile] = useState({})
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      const { data: vetData } = await supabase
        .from('veterinaires')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!vetData) { setLoading(false); return }
      setVet(vetData)

      const { data: rdvData } = await supabase
        .from('rendez_vous')
        .select(`
          id, maitre_id, date_rdv, heure_rdv, motif, status, notes_vet, carnet_url,
          pet:pets!rendez_vous_pet_id_fkey(id, name, species),
          profiles!rendez_vous_maitre_id_fkey ( full_name, phone )
        `)
        .eq('veterinaire_id', vetData.id)
        .order('date_rdv', { ascending: false })

      setAppointments(rdvData || [])
      setLoading(false)
    }
    fetchData()
  }, [user])

  const handleAction = async (rdvId, action) => {
    setActionLoading(rdvId)
    const rdv = appointments.find(a => a.id === rdvId)
    try {
      let update = {}

      if (action === 'confirm') {
        update = { status: 'confirmed' }
      } else if (action === 'reject') {
        update = { status: 'cancelled' }
      } else if (action === 'complete') {
        const noteToSave = localNotes[rdvId] || ''
        update = { status: 'done', notes_vet: noteToSave }

        const file = carnetFile[rdvId]
        if (file && rdv?.pet?.id) {
          const ext = file.name.split('.').pop()
          const path = `${rdv.pet.id}/${rdvId}.${ext}`
          const { data: upload, error: uploadError } = await supabase.storage
            .from('pets')
            .upload(path, file, { upsert: true })
          if (!uploadError) update.carnet_url = upload.path
        }
      }

      const { error } = await supabase
        .from('rendez_vous')
        .update(update)
        .eq('id', rdvId)
        .eq('veterinaire_id', vet.id)
      if (error) throw error

      if (rdv?.maitre_id) {
        const messages = {
          confirm: { title: 'Rendez-vous confirmé', message: `Votre RDV du ${rdv.date_rdv} à ${rdv.heure_rdv?.substring(0, 5)} est confirmé` },
          reject: { title: 'Rendez-vous refusé', message: `Votre RDV du ${rdv.date_rdv} à ${rdv.heure_rdv?.substring(0, 5)} a été refusé` },
          complete: { title: 'Consultation terminée', message: `La consultation du ${rdv.date_rdv} est terminée` },
        }
        if (messages[action]) {
          await supabase.from('notifications').insert({ user_id: rdv.maitre_id, ...messages[action], read: false })
        }

        const { data: ownerProfile } = await supabase.from('profiles').select('email, full_name').eq('id', rdv.maitre_id).single()
        
        console.log('Attempting to send email to owner...', {
          action,
          ownerEmail: ownerProfile?.email,
          rdvId
        })

        if (ownerProfile?.email && action === 'confirm') {
          sendEmail(ownerProfile.email, 'Rendez-vous confirme - Veto Care',
            emailTemplates.appointmentConfirmed({
              ownerName: ownerProfile.full_name || 'Client',
              vetName: profile?.full_name || 'Vétérinaire',
              date: rdv.date_rdv, time: rdv.heure_rdv?.substring(0, 5), petName: rdv.pet?.name
            })
          ).then(res => console.log('Owner confirmation email result:', res))
        }
        if (ownerProfile?.email && action === 'reject') {
          sendEmail(ownerProfile.email, 'Rendez-vous refuse/annule - Veto Care',
            emailTemplates.appointmentDeclined({
              ownerName: ownerProfile.full_name || 'Client',
              vetName: profile?.full_name || 'Vétérinaire',
              date: rdv.date_rdv, time: rdv.heure_rdv?.substring(0, 5), petName: rdv.pet?.name
            })
          ).then(res => console.log('Owner decline email result:', res))
        }
        if (ownerProfile?.email && action === 'complete') {
          sendEmail(ownerProfile.email, 'Merci de votre visite - Veto Care',
            emailTemplates.consultationCompleted({
              ownerName: ownerProfile.full_name || 'Client',
              vetName: profile?.full_name || 'Vétérinaire',
              petName: rdv.pet?.name || 'votre animal'
            })
          ).then(res => console.log('Owner completion email result:', res))
        }
      }

      setAppointments(prev => prev.map(a => a.id === rdvId ? { ...a, ...update } : a))
      setExpandedId(null)
      setNotes(prev => { const n = { ...prev }; delete n[rdvId]; return n })
      setLocalNotes(prev => { const n = { ...prev }; delete n[rdvId]; return n })
      setCarnetFile(prev => { const c = { ...prev }; delete c[rdvId]; return c })
      toast.success(action === 'complete' ? 'Consultation terminée' : action === 'confirm' ? 'Confirmé ✓' : 'Refusé')
    } catch (err) {
      toast.error(err.message || 'Erreur')
    } finally {
      setActionLoading(null)
    }
  }

  const handleStatusChange = async (rdvId, newStatus) => {
    setActionLoading(rdvId)
    try {
      const { error } = await supabase
        .from('rendez_vous')
        .update({ status: newStatus })
        .eq('id', rdvId)
        .eq('veterinaire_id', vet.id)

      if (error) throw error
      
      const rdv = appointments.find(a => a.id === rdvId)
      const { data: ownerProfile } = await supabase.from('profiles').select('email, full_name').eq('id', rdv?.maitre_id).single()
      
      if (ownerProfile?.email) {
        if (newStatus === 'done') {
          sendEmail(ownerProfile.email, 'Merci de votre visite - Veto Care',
            emailTemplates.consultationCompleted({
              ownerName: ownerProfile.full_name || 'Client',
              vetName: profile?.full_name || 'Vétérinaire',
              petName: rdv?.pet?.name || 'votre animal'
            })
          ).then(res => console.log('Owner completion email via dropdown:', res))
        }
        if (newStatus === 'confirmed') {
          sendEmail(ownerProfile.email, 'Rendez-vous confirme - Veto Care',
            emailTemplates.appointmentConfirmed({
              ownerName: ownerProfile.full_name || 'Client',
              vetName: profile?.full_name || 'Vétérinaire',
              date: rdv?.date_rdv, time: rdv?.heure_rdv?.substring(0, 5), petName: rdv?.pet?.name
            })
          ).then(res => console.log('Owner confirmed email via dropdown:', res))
        }
        if (newStatus === 'cancelled') {
          sendEmail(ownerProfile.email, 'Rendez-vous refuse/annule - Veto Care',
            emailTemplates.appointmentDeclined({
              ownerName: ownerProfile.full_name || 'Client',
              vetName: profile?.full_name || 'Vétérinaire',
              date: rdv?.date_rdv, time: rdv?.heure_rdv?.substring(0, 5), petName: rdv?.pet?.name
            })
          ).then(res => console.log('Owner cancelled email via dropdown:', res))
        }
      }
      
      setAppointments(prev => prev.map(a => a.id === rdvId ? { ...a, status: newStatus } : a))
      toast.success('Statut mis à jour manuellement')
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la modification')
    } finally {
      setActionLoading(null)
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const pending = appointments.filter(a => a.status === 'pending')
  const upcoming = appointments.filter(a => a.date_rdv >= today && a.status === 'confirmed')
  const past = appointments.filter(a => (a.date_rdv < today && a.status === 'confirmed') || a.status === 'done')
  const cancelled = appointments.filter(a => a.status === 'cancelled')

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Rendez-vous</h1>
          <p className="text-gray-600 mt-1">Gérez tous vos rendez-vous</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        ) : (
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList className="bg-white border border-gray-100 rounded-xl p-1">
              <TabsTrigger value="pending">En attente ({pending.length})</TabsTrigger>
              <TabsTrigger value="upcoming">À venir ({upcoming.length})</TabsTrigger>
              <TabsTrigger value="past">Passés ({past.length})</TabsTrigger>
              <TabsTrigger value="cancelled">Annulés ({cancelled.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-3 mt-4">
              {pending.length === 0
                ? <Card className="p-8 text-center rounded-2xl border border-gray-100 shadow-sm"><Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">Aucune demande en attente</p></Card>
                : pending.map(rdv => <AppointmentCard key={rdv.id} rdv={rdv} expandedId={expandedId} setExpandedId={setExpandedId} localNotes={localNotes} setLocalNotes={setLocalNotes} carnetFile={carnetFile} setCarnetFile={setCarnetFile} handleAction={handleAction} actionLoading={actionLoading} handleStatusChange={handleStatusChange} />)
              }
            </TabsContent>
            <TabsContent value="upcoming" className="space-y-3 mt-4">
              {upcoming.length === 0
                ? <Card className="p-8 text-center rounded-2xl border border-gray-100 shadow-sm"><Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">Aucun rendez-vous à venir</p></Card>
                : upcoming.map(rdv => <AppointmentCard key={rdv.id} rdv={rdv} expandedId={expandedId} setExpandedId={setExpandedId} localNotes={localNotes} setLocalNotes={setLocalNotes} carnetFile={carnetFile} setCarnetFile={setCarnetFile} handleAction={handleAction} actionLoading={actionLoading} handleStatusChange={handleStatusChange} />)
              }
            </TabsContent>
            <TabsContent value="past" className="space-y-3 mt-4">
              {past.length === 0
                ? <Card className="p-8 text-center rounded-2xl border border-gray-100 shadow-sm"><p className="text-gray-500">Aucun rendez-vous passé</p></Card>
                : past.map(rdv => <AppointmentCard key={rdv.id} rdv={rdv} expandedId={expandedId} setExpandedId={setExpandedId} localNotes={localNotes} setLocalNotes={setLocalNotes} carnetFile={carnetFile} setCarnetFile={setCarnetFile} handleAction={handleAction} actionLoading={actionLoading} handleStatusChange={handleStatusChange} />)
              }
            </TabsContent>
            <TabsContent value="cancelled" className="space-y-3 mt-4">
              {cancelled.length === 0
                ? <Card className="p-8 text-center rounded-2xl border border-gray-100 shadow-sm"><p className="text-gray-500">Aucun rendez-vous annulé</p></Card>
                : cancelled.map(rdv => <AppointmentCard key={rdv.id} rdv={rdv} expandedId={expandedId} setExpandedId={setExpandedId} localNotes={localNotes} setLocalNotes={setLocalNotes} carnetFile={carnetFile} setCarnetFile={setCarnetFile} handleAction={handleAction} actionLoading={actionLoading} handleStatusChange={handleStatusChange} />)
              }
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  )
}