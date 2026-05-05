import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/context/useAuth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { ArrowLeft, FileText, PawPrint, Upload } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { getSpeciesImage } from '@/lib/constants'

export default function PatientDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [pet, setPet] = useState(null)
  const [carnets, setCarnets] = useState([])
  const [loading, setLoading] = useState(true)

  const [openUpload, setOpenUpload] = useState(false)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const petAge = useMemo(() => {
    if (!pet?.date_of_birth) return '-'
    return Math.floor((Date.now() - new Date(pet.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  }, [pet])

  useEffect(() => {
    if (!user || !id) return

    const fetchData = async () => {
      try {
        const [petRes, carnetRes] = await Promise.all([
          supabase
            .from('pets')
            .select(`
              *,
              profiles!pets_owner_id_fkey ( full_name, phone, wilaya )
            `)
            .eq('id', id)
            .single(),
          supabase
            .from('pet_carnets')
            .select('*')
            .eq('pet_id', id)
            .order('uploaded_at', { ascending: false }),
        ])

        if (petRes.error) throw petRes.error
        setPet(petRes.data)
        setCarnets(carnetRes.data || [])
      } catch (error) {
        toast.error(error.message || 'Erreur lors du chargement du dossier patient')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, user])

  const handleUpload = async () => {
    if (!file) {
      toast.error('Veuillez sélectionner un fichier')
      return
    }
    if (!pet) return

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}.${ext}`
      const path = `${pet.id}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pets')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: inserted, error: insertError } = await supabase
        .from('pet_carnets')
        .insert({
          pet_id: pet.id,
          owner_id: pet.owner_id,
          title: title.trim() || `Document ${format(new Date(), 'dd/MM/yyyy')}`,
          file_url: uploadData.path,
          file_type: file.type || null,
        })
        .select()
        .single()

      if (insertError) throw insertError

      setCarnets((prev) => [inserted, ...prev])
      setTitle('')
      setFile(null)
      setOpenUpload(false)
      toast.success('Document ajouté au carnet')
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'ajout du document")
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </DashboardLayout>
    )
  }

  if (!pet) {
    return (
      <DashboardLayout>
        <Card className="p-8 text-center rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500">Patient introuvable</p>
          <Button onClick={() => navigate('/dashboard/vet/patients')} className="mt-4 rounded-xl bg-teal-600 hover:bg-teal-700">Retour</Button>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <button
          onClick={() => navigate('/dashboard/vet/patients')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600"
        >
          <ArrowLeft className="h-4 w-4" /> Retour aux patients
        </button>

        <Card className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="h-28 w-28 rounded-2xl overflow-hidden bg-gray-100 shrink-0 ring-2 ring-white">
              <img
                src={getSpeciesImage(pet.species)}
                alt={pet.name}
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&auto=format&fit=crop' }}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold font-heading text-gray-900">{pet.name}</h1>
              <p className="text-gray-600 mt-1">{pet.species} • {pet.breed || 'Race non précisée'} • {petAge} ans</p>
              <p className="text-sm text-gray-500 mt-2">Propriétaire: {pet.profiles?.full_name || '-'}</p>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-heading text-gray-900">Carnet du patient</h2>
          <Button className="h-11 rounded-xl bg-teal-600 hover:bg-teal-700" onClick={() => setOpenUpload(true)}>
            <Upload className="h-4 w-4 mr-2" /> Ajouter un document
          </Button>
        </div>

        {carnets.length === 0 ? (
          <Card className="p-8 text-center rounded-2xl border border-gray-100 shadow-sm">
            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun document dans ce carnet</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {carnets.map((item) => (
              <Card key={item.id} className="p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{item.title || 'Document sans titre'}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.file_type || 'Fichier'} • {item.uploaded_at ? format(new Date(item.uploaded_at), 'dd MMM yyyy HH:mm', { locale: fr }) : '-'}
                    </p>
                  </div>
                  <a
                    href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/pets/${item.file_url}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button variant="outline" className="rounded-xl border-gray-200">Ouvrir</Button>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={openUpload} onOpenChange={setOpenUpload}>
        <DialogContent className="rounded-2xl border border-gray-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter un document au carnet</DialogTitle>
            <DialogDescription>
              Le fichier sera stocké dans le dossier médical du patient.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium">Titre</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Radiographie thorax"
                className="h-11 rounded-xl border-gray-200 focus-visible:ring-teal-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Fichier</label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="h-11 rounded-xl border-gray-200"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="rounded-xl border-gray-200" onClick={() => setOpenUpload(false)}>Annuler</Button>
            <Button className="rounded-xl bg-teal-600 hover:bg-teal-700" onClick={handleUpload} disabled={uploading}>
              {uploading ? 'Téléversement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
