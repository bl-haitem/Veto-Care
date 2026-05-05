import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/context/useAuth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Calendar,
  FileText,
  Stethoscope,
  Syringe,
  Activity,
  PawPrint,
  Clock,
  Hash,
  Printer,
  ChevronRight,
  Trash2,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

export default function AnimalDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [animal, setAnimal] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)   // carnet id being deleted
  const [confirmItem, setConfirmItem] = useState(null)  // carnet item to confirm delete

  const petAge = animal?.date_of_birth
    ? Math.floor((Date.now() - new Date(animal.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  useEffect(() => {
    if (!user || !id) return
    const fetchData = async () => {
      try {
        const [animalRes, historyRes] = await Promise.all([
          supabase.from('pets').select('*').eq('id', id).single(),
          supabase.from('pet_carnets').select('*').eq('pet_id', id).order('uploaded_at', { ascending: false })
        ])
        if (animalRes.error) throw animalRes.error
        setAnimal(animalRes.data)
        setHistory(historyRes.data || [])
      } catch (error) {
        console.error('Error fetching animal details:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, user])

  // ── Delete a carnet entry ──────────────────────────────────────────────────
  const handleDeleteCarnet = async (item) => {
    setDeletingId(item.id)
    try {
      // 1. Remove the file from Storage (best-effort)
      if (item.file_url) {
        await supabase.storage.from('pets').remove([item.file_url])
      }

      // 2. Delete the DB record
      const { error } = await supabase.from('pet_carnets').delete().eq('id', item.id)
      if (error) throw error

      // 3. Optimistic update
      setHistory(prev => prev.filter(h => h.id !== item.id))
      toast.success('Dossier médical supprimé avec succès')
    } catch (err) {
      console.error(err)
      toast.error("Erreur lors de la suppression du dossier")
    } finally {
      setDeletingId(null)
      setConfirmItem(null)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-10">
          <Skeleton className="h-64 w-full rounded-[3rem] dark:bg-slate-900" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <Skeleton className="h-96 lg:col-span-2 rounded-[3rem] dark:bg-slate-900" />
            <Skeleton className="h-96 rounded-[3rem] dark:bg-slate-900" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!animal) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-32">
          <div className="h-24 w-24 bg-gray-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Activity className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white">Animal non identifié</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Ce dossier n'est plus accessible ou a été déplacé.</p>
          <Button onClick={() => navigate('/dashboard/owner/pets')} className="mt-8 rounded-2xl px-10 h-14 font-black shadow-xl shadow-primary/20 transition-all hover:scale-105">
            Retour à la liste
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-10 focus-visible:outline-none">
        <button
          onClick={() => navigate('/dashboard/owner/pets')}
          className="group flex items-center gap-3 text-sm text-gray-400 dark:text-gray-500 hover:text-primary transition-all font-black uppercase tracking-widest"
        >
          <div className="h-8 w-8 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <span>Revenir à mes compagnons</span>
        </button>

        {/* Hero Section */}
        <Card className="relative overflow-hidden border-none rounded-[3rem] bg-white dark:bg-slate-900 shadow-2xl dark:shadow-none p-10 sm:p-12 group">
          <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none group-hover:scale-110 group-hover:rotate-6 transition-transform duration-1000">
            <PawPrint size={250} className="text-primary" />
          </div>
          <div className="flex flex-col md:flex-row gap-12 items-center md:items-start relative z-10">
            <div className="relative">
              <div className="h-48 w-48 rounded-[2.5rem] bg-teal-50 dark:bg-teal-500/5 overflow-hidden shrink-0 shadow-2xl border-8 border-white dark:border-slate-800 ring-1 ring-gray-100 dark:ring-slate-800 transition-transform duration-500 group-hover:scale-105">
                {animal.photo_url ? (
                  <img
                    src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/pets/${animal.photo_url}`}
                    alt={animal.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-primary/10">
                    <Activity size={80} />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-4 -right-4 h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-900 group-hover:rotate-12 transition-transform">
                <PawPrint size={24} />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left pt-0 md:pt-4">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-5 mb-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter">{animal.name}</h1>
                <div className="bg-primary/10 text-primary border border-primary/20 rounded-2xl px-4 md:px-5 py-1 md:py-1.5 text-[10px] font-black uppercase tracking-[0.2em] w-fit mx-auto md:mx-0">
                  {animal.species}
                </div>
              </div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-500 mb-6 md:mb-10 tracking-tight">
                {animal.breed || 'Race non précisée'} <span className="mx-2 md:mx-4 opacity-20">•</span> {animal.date_of_birth ? Math.floor((new Date() - new Date(animal.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000)) : '-'} ans
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap justify-center md:justify-start gap-4 md:gap-6">
                <Link to="/vets" className="w-full sm:w-auto">
                  <Button className="w-full h-14 md:h-16 rounded-2xl px-8 md:px-10 flex items-center justify-center gap-3 font-black text-base md:text-lg shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95">
                    <Calendar className="h-5 w-5 md:h-6 md:w-6" />
                    <span>Réserver un RDV</span>
                  </Button>
                </Link>
                <Button variant="outline" className="w-full sm:w-auto h-14 md:h-16 rounded-2xl px-8 md:px-10 border-gray-100 dark:border-slate-800 text-gray-500 dark:text-gray-400 font-black text-base md:text-lg flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">
                  <Printer className="h-5 w-5 md:h-6 md:w-6" />
                  <span>Imprimer Carnet</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="health" className="w-full">
          <TabsList className="bg-white dark:bg-slate-900 p-1.5 md:p-2 rounded-[2rem] w-full lg:w-fit mb-8 md:mb-10 shadow-xl dark:shadow-none border border-gray-100 dark:border-slate-800 overflow-x-auto flex-nowrap justify-start">
            <TabsTrigger value="health" className="flex-1 lg:flex-none rounded-[1.5rem] px-6 md:px-10 h-10 md:h-12 data-[state=active]:bg-primary data-[state=active]:text-white shadow-none transition-all font-black text-[10px] md:text-xs uppercase tracking-widest dark:text-gray-400 whitespace-nowrap">
              <Stethoscope className="h-4 w-4 mr-2" />
              Carnet de santé
            </TabsTrigger>
            <TabsTrigger value="info" className="flex-1 lg:flex-none rounded-[1.5rem] px-6 md:px-10 h-10 md:h-12 data-[state=active]:bg-primary data-[state=active]:text-white shadow-none transition-all font-black text-[10px] md:text-xs uppercase tracking-widest dark:text-gray-400 whitespace-nowrap">
              <FileText className="h-4 w-4 mr-2" />
              Dossier Complet
            </TabsTrigger>
          </TabsList>

          {/* ── HEALTH RECORD ── */}
          <TabsContent value="health" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-6 duration-700">
            <Card className="p-10 sm:p-12 bg-white dark:bg-slate-900 border-none shadow-2xl dark:shadow-none rounded-[3.5rem] relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Timeline Médicale</h2>
                  <p className="text-sm text-gray-400 dark:text-gray-500 font-medium mt-1">L'historique complet des soins et interventions</p>
                </div>
                <div className="flex items-center gap-3 bg-teal-50 dark:bg-teal-500/10 px-6 py-3 rounded-2xl border border-teal-100 dark:border-teal-500/20">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">{history.length} Actes Médicaux</span>
                </div>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-32 bg-gray-50/50 dark:bg-slate-800/30 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-slate-800">
                  <div className="h-24 w-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <FileText className="h-10 w-10 text-gray-200 dark:text-slate-700" />
                  </div>
                  <h4 className="text-xl font-black text-gray-900 dark:text-white">Dossier vierge</h4>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Les interventions de votre vétérinaire s'afficheront ici.</p>
                </div>
              ) : (
                <div className="space-y-12 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px before:h-full before:w-1 before:bg-gradient-to-b before:from-primary/30 before:via-primary/10 before:to-transparent">
                  {history.map((item) => (
                    <div key={item.id} className="relative flex items-start gap-10 group">
                      {/* Timeline dot icon */}
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 z-10 transition-all duration-500 border-4 border-white dark:border-slate-900 shadow-xl ${item.type === 'vaccination' ? 'bg-blue-600 text-white shadow-blue-200/50' :
                        item.type === 'prescription' ? 'bg-emerald-600 text-white shadow-emerald-200/50' :
                          'bg-primary text-white shadow-primary/30'
                        } group-hover:scale-110 group-hover:rotate-6`}>
                        {item.type === 'vaccination' ? <Syringe size={24} /> :
                          item.type === 'prescription' ? <FileText size={24} /> :
                            <Stethoscope size={24} />}
                      </div>

                      {/* Card */}
                      <div className="flex-1 bg-white dark:bg-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:border-primary/10">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${item.type === 'vaccination' ? 'text-blue-500' :
                                item.type === 'prescription' ? 'text-emerald-500' :
                                  'text-primary'
                                }`}>{item.type}</span>
                              <div className="h-1 w-1 rounded-full bg-gray-300 dark:bg-slate-700" />
                              <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Compte-rendu Vétérinaire</span>
                            </div>
                            <h4 className="font-black text-gray-900 dark:text-white text-2xl tracking-tight">
                              {item.title || (item.type === 'vaccination' ? 'Protection Vaccinale' : item.type === 'prescription' ? 'Traitement Médical' : 'Examen de Santé')}
                            </h4>
                          </div>

                          {/* Date + Delete button */}
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="px-5 py-2.5 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-inner">
                              <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                {item.uploaded_at
                                  ? format(new Date(item.uploaded_at), 'dd MMM yyyy', { locale: fr })
                                  : item.date
                                    ? format(new Date(item.date), 'dd MMM yyyy', { locale: fr })
                                    : '—'}
                              </span>
                            </div>
                            {/* ── DELETE BUTTON ── */}
                            <button
                              onClick={() => setConfirmItem(item)}
                              disabled={deletingId === item.id}
                              title="Supprimer ce dossier"
                              className="h-10 w-10 rounded-xl flex items-center justify-center border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 hover:scale-110 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {deletingId === item.id
                                ? <span className="h-4 w-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                                : <Trash2 className="h-4 w-4" />
                              }
                            </button>
                          </div>
                        </div>

                        {item.description && (
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg font-medium whitespace-pre-wrap mb-6">{item.description}</p>
                        )}

                        {/* File link */}
                        {item.file_url && (
                          <a
                            href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/pets/${item.file_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest hover:underline mb-4"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Voir le document ({item.file_type || 'fichier'})
                          </a>
                        )}

                        <div className="mt-4 pt-6 border-t border-gray-50 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-400 dark:text-gray-600">
                            <Clock size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              Mis à jour par Dr. {item.veterinaire_name || 'Vétérinaire'}
                            </span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-200 dark:text-slate-700 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* ── COMPLETE FILE ── */}
          <TabsContent value="info" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-6 duration-700">
            <Card className="p-12 bg-white dark:bg-slate-900 border-none shadow-2xl dark:shadow-none rounded-[3.5rem]">
              <div className="mb-12">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Fiche d'Identité</h2>
                <p className="text-sm text-gray-400 dark:text-gray-500 font-medium mt-1">Informations certifiées du dossier animalier</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {[
                  { label: "Nom de baptême", value: animal.name, icon: PawPrint },
                  { label: "Classification", value: animal.species, icon: Activity },
                  { label: "Race / Variété", value: animal.breed || 'Non spécifiée', icon: Hash },
                  { label: "Âge Révolu", value: petAge !== null ? `${petAge} ans` : '-', icon: Clock },
                  { label: "Date d'Enregistrement", value: format(new Date(animal.created_at), 'dd MMMM yyyy', { locale: fr }), icon: Calendar },
                  { label: "Statut du Dossier", value: "ACTIF / CERTIFIÉ", highlight: true, icon: FileText }
                ].map((info, idx) => (
                  <div key={idx} className={`p-8 rounded-[2.5rem] border transition-all duration-500 ${info.highlight
                    ? 'bg-primary/5 border-primary/20 shadow-lg shadow-primary/5'
                    : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-primary/20'
                    }`}>
                    <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-primary mb-4 shadow-sm">
                      <info.icon size={20} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">{info.label}</p>
                    <p className={`text-2xl font-black tracking-tight ${info.highlight ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>
                      {info.value}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Confirm Delete Dialog ── */}
      <Dialog open={!!confirmItem} onOpenChange={(open) => !open && setConfirmItem(null)}>
        <DialogContent className="rounded-3xl border-none shadow-2xl max-w-md">
          <DialogHeader>
            <div className="mx-auto h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4 text-red-500">
              <Trash2 className="h-8 w-8" />
            </div>
            <DialogTitle className="text-2xl font-black text-center text-gray-900 dark:text-white">
              Supprimer ce dossier ?
            </DialogTitle>
            <DialogDescription className="text-center text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              Le dossier <span className="font-black text-gray-700 dark:text-gray-200">&quot;{confirmItem?.title || 'sans titre'}&quot;</span> sera définitivement supprimé ainsi que son fichier joint. Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setConfirmItem(null)}
              className="flex-1 h-12 rounded-2xl font-bold border-gray-100 dark:border-slate-700"
            >
              Annuler
            </Button>
            <Button
              onClick={() => handleDeleteCarnet(confirmItem)}
              disabled={deletingId === confirmItem?.id}
              className="flex-1 h-12 rounded-2xl font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition-all border-0"
            >
              {deletingId === confirmItem?.id
                ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                : <Trash2 className="h-4 w-4 mr-2" />}
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  )
}
