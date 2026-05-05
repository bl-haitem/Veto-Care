import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/context/useAuth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { PlusCircle, PawPrint, Info, Edit, Trash2, FileText, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import PetForm from '@/components/pets/PetForm'
import { getSpeciesImage } from '@/lib/constants'

export default function MyAnimals() {
  const { user } = useAuth()
  const [animals, setAnimals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingAnimal, setEditingAnimal] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [editingCarnets, setEditingCarnets] = useState([])   // carnets of the animal being edited
  const [deletingCarnetId, setDeletingCarnetId] = useState(null)

  useEffect(() => {
    if (!user) return
    fetchAnimals()
  }, [user])

  const fetchAnimals = async () => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*, pet_carnets(id)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setAnimals(data || [])
    } catch (err) {
      console.error('Error fetching animals:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData) => {
    setSubmitting(true)
    try {
      // ── 1. Build pets payload (strict schema) ──────────────────────────
      const petPayload = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed || null,
        gender: formData.gender || null,
        date_of_birth: formData.date_of_birth || null,
        notes: formData.notes || null,
        owner_id: user.id,
      }

      let petId = editingAnimal?.id

      if (editingAnimal) {
        const { error } = await supabase.from('pets').update(petPayload).eq('id', editingAnimal.id)
        if (error) throw error
        toast.success('Animal modifié avec succès')
      } else {
        const { data, error } = await supabase.from('pets').insert(petPayload).select('id').single()
        if (error) throw error
        petId = data.id
        toast.success('Animal ajouté avec succès')
      }

      // ── 2. Upload medical document to pet_carnets (if provided) ────────
      if (formData.medicalFile && petId) {
        const file = formData.medicalFile
        const ext = file.name.split('.').pop()
        const fileName = `${user.id}/${petId}/${Date.now()}.${ext}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('pets')
          .upload(fileName, file, { upsert: true })

        if (uploadError) {
          toast.error('Animal sauvegardé, mais erreur lors du téléversement du document.')
        } else {
          const { error: carnetError } = await supabase.from('pet_carnets').insert({
            pet_id: petId,
            owner_id: user.id,
            title: formData.medicalTitle || file.name,
            file_url: uploadData.path,
            file_type: ext.toUpperCase(),
          })
          if (carnetError) {
            toast.error('Document non sauvegardé: ' + carnetError.message)
          } else {
            toast.success('Document médical ajouté')
          }
        }
      }

      setShowAddDialog(false)
      setEditingAnimal(null)
      fetchAnimals()
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'enregistrement")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer cet animal ?')) return
    try {
      const { error } = await supabase.from('pets').delete().eq('id', id)
      if (error) throw error
      setAnimals(animals.filter((a) => a.id !== id))
      toast.success('Animal supprimé')
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const openEdit = async (animal) => {
    setEditingAnimal(animal)
    setEditingCarnets([])
    setShowAddDialog(true)
    // Fetch existing medical files for this animal
    const { data } = await supabase
      .from('pet_carnets')
      .select('*')
      .eq('pet_id', animal.id)
      .order('uploaded_at', { ascending: false })
    setEditingCarnets(data || [])
  }

  const closeDialog = () => {
    setShowAddDialog(false)
    setEditingAnimal(null)
    setEditingCarnets([])
  }

  const handleDeleteCarnet = async (carnet) => {
    setDeletingCarnetId(carnet.id)
    try {
      // Remove from storage (best-effort)
      if (carnet.file_url) {
        await supabase.storage.from('pets').remove([carnet.file_url])
      }
      const { error } = await supabase.from('pet_carnets').delete().eq('id', carnet.id)
      if (error) throw error
      setEditingCarnets(prev => prev.filter(c => c.id !== carnet.id))
      // Also refresh main list badge count
      setAnimals(prev => prev.map(a =>
        a.id === editingAnimal?.id
          ? { ...a, pet_carnets: a.pet_carnets.filter(c => c.id !== carnet.id) }
          : a
      ))
      toast.success('Fichier supprimé avec succès')
    } catch (err) {
      console.error(err)
      toast.error('Erreur lors de la suppression du fichier')
    } finally {
      setDeletingCarnetId(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black font-heading text-gray-900 dark:text-white tracking-tight">Mes Animaux</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium leading-relaxed">Gérez vos compagnons et leur dossier médical</p>
          </div>
          <Button
            onClick={() => { setEditingAnimal(null); setShowAddDialog(true) }}
            className="flex items-center gap-2 rounded-2xl h-12 px-6 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Ajouter un animal</span>
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-72 w-full rounded-[2.5rem] dark:bg-slate-900" />
            ))}
          </div>
        ) : animals.length === 0 ? (
          <Card className="p-16 text-center flex flex-col items-center justify-center border-none bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm">
            <div className="h-24 w-24 bg-teal-50 dark:bg-teal-500/10 rounded-[2rem] flex items-center justify-center mb-6">
              <PawPrint className="h-12 w-12 text-primary opacity-40" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Aucun animal enregistré</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm font-medium leading-relaxed">
              Commencez par ajouter votre premier compagnon.
            </p>
            <Button
              onClick={() => { setEditingAnimal(null); setShowAddDialog(true) }}
              className="mt-8 rounded-2xl h-12 px-8 font-bold shadow-lg shadow-primary/20"
            >
              Ajouter mon premier animal
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {animals.map((animal) => (
              <Card key={animal.id} className="overflow-hidden group hover:shadow-2xl transition-all duration-500 border-none bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none">
                {/* Cover image – static species photo */}
                <div className="h-56 bg-gray-100 dark:bg-slate-800 relative overflow-hidden">
                  <img
                    src={getSpeciesImage(animal.species)}
                    alt={animal.name}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&auto=format&fit=crop' }}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Badge: has medical file */}
                  {animal.pet_carnets && animal.pet_carnets.length > 0 && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 text-[#14a38b] text-xs font-bold">
                      <FileText className="h-3.5 w-3.5" />
                      {animal.pet_carnets.length} dossier{animal.pet_carnets.length > 1 ? 's' : ''}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-10 w-10 rounded-xl shadow-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md dark:text-white transition-all"
                      onClick={() => openEdit(animal)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-10 w-10 rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                      onClick={() => handleDelete(animal.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-white text-xs font-black uppercase tracking-[0.2em]">{animal.species}</p>
                    <h3 className="text-white text-2xl font-black font-heading mt-1">{animal.name}</h3>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    {animal.date_of_birth && (
                      <div className="px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20 text-[10px] font-black text-primary uppercase tracking-widest">
                        {Math.floor((new Date() - new Date(animal.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000))} ans
                      </div>
                    )}
                    {animal.breed && (
                      <div className="px-3 py-1 rounded-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {animal.breed}
                      </div>
                    )}
                  </div>
                  <Link to={`/dashboard/owner/pets/${animal.id}`}>
                    <Button variant="outline" className="w-full h-12 rounded-2xl flex items-center gap-3 font-bold dark:border-slate-800 dark:text-gray-300 transition-all group-hover:bg-primary group-hover:text-white group-hover:border-primary">
                      <Info className="h-4 w-4" />
                      <span>Détails &amp; Carnet de santé</span>
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={closeDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black font-heading">
              {editingAnimal ? `Modifier ${editingAnimal.name}` : 'Ajouter un animal'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Formulaire pour ajouter ou modifier un animal.
            </DialogDescription>
          </DialogHeader>

          {/* ── Existing medical files (edit mode only) ── */}
          {editingAnimal && (
            <div className="mb-2">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Fichiers médicaux existants
                <span className="ml-auto text-xs font-black text-primary bg-teal-50 dark:bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-100 dark:border-teal-500/20">
                  {editingCarnets.length} fichier{editingCarnets.length !== 1 ? 's' : ''}
                </span>
              </p>

              {editingCarnets.length === 0 ? (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-dashed border-gray-200 dark:border-slate-700">
                  <FileText className="h-5 w-5 text-gray-300 dark:text-slate-600 shrink-0" />
                  <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Aucun fichier médical pour cet animal.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {editingCarnets.map((carnet) => (
                    <div
                      key={carnet.id}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20 group"
                    >
                      {/* Icon */}
                      <div className="h-9 w-9 rounded-xl bg-[#14a38b] flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-white" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-teal-900 dark:text-teal-100 truncate">
                          {carnet.title || 'Sans titre'}
                        </p>
                        <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                          {carnet.file_type || 'Fichier'}
                          {carnet.uploaded_at && ` · ${new Date(carnet.uploaded_at).toLocaleDateString('fr-FR')}`}
                        </p>
                      </div>

                      {/* View link */}
                      {carnet.file_url && (
                        <a
                          href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/pets/${carnet.file_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-teal-500 hover:bg-teal-100 dark:hover:bg-teal-500/20 transition-colors"
                          title="Voir le fichier"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteCarnet(carnet)}
                        disabled={deletingCarnetId === carnet.id}
                        title="Supprimer ce fichier"
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {deletingCarnetId === carnet.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="h-px bg-gray-100 dark:bg-slate-800 mt-4" />
            </div>
          )}

          <PetForm
            key={editingAnimal ? editingAnimal.id : 'new'}
            onSubmit={handleSubmit}
            isLoading={submitting}
            initialData={editingAnimal}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
