import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/context/useAuth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search,
  PawPrint,
  User,
  ArrowRight,
  Activity,
  Filter,
  ChevronRight,
  Heart,
  Calendar,
  Hash
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getSpeciesImage, SPECIES } from '@/lib/constants'

export default function PatientManagement() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [speciesFilter, setSpeciesFilter] = useState('all')

  useEffect(() => {
    if (!user) return
    const fetchPatients = async () => {
      try {
        const { data: vetData } = await supabase
          .from('veterinaires')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (!vetData) return

        const { data, error } = await supabase
          .from('rendez_vous')
          .select(`
            pet_id,
            pet:pets!rendez_vous_pet_id_fkey (
              id, name, species, date_of_birth, photo_url, breed,
              profiles!pets_owner_id_fkey ( full_name, phone, wilaya )
            )
          `)
          .eq('veterinaire_id', vetData.id)
          .not('pet_id', 'is', null)

        if (error) throw error

        const uniqueAnimals = []
        const seenIds = new Set()
        data?.forEach(item => {
          if (item.pet && !seenIds.has(item.pet.id)) {
            seenIds.add(item.pet.id)
            uniqueAnimals.push(item.pet)
          }
        })

        setPatients(uniqueAnimals)
      } catch (error) {
        console.error('Error fetching patients:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPatients()
  }, [user])

  const filteredPatients = patients.filter(p => {
    const matchesSearch =
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSpecies = speciesFilter === 'all' || (p.species || '').toLowerCase() === speciesFilter.toLowerCase()

    return matchesSearch && matchesSpecies
  })

  // Species filter list from constants (no duplicates or legacy ones)
  const speciesList = SPECIES.map(s => s.toLowerCase())

  return (
    <DashboardLayout>
      <div className="space-y-10 focus-visible:outline-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black font-heading text-gray-900 tracking-tight">Base de Données Patients</h1>
            <p className="text-gray-600 mt-1 font-medium leading-relaxed">
              Consultez et gérez l'historique médical complet de votre patientèle
            </p>
          </div>
          <div className="flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-2xl border border-teal-100">
            <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-[10px] font-black text-teal-700 uppercase tracking-widest">{patients.length} Patients Actifs</span>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
            <Input
              placeholder="Rechercher un animal, un propriétaire, un ID..."
              className="pl-12 h-11 bg-white border border-gray-200 rounded-xl focus-visible:ring-teal-500 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
            <SelectTrigger className="h-11 bg-white border border-gray-200 rounded-xl font-medium">
              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-primary" />
                <SelectValue placeholder="Toutes les espèces" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-gray-100 shadow-xl">
              <SelectItem value="all">Toutes les espèces</SelectItem>
              {speciesList.map(s => (
                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="h-11 rounded-xl border-gray-200 text-gray-500 hover:text-red-500 hover:bg-red-50 font-bold"
            onClick={() => {
              setSearchTerm('')
              setSpeciesFilter('all')
            }}
          >
            Réinitialiser
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-80 w-full rounded-2xl" />)}
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <PawPrint className="h-12 w-12 text-gray-200" />
            </div>
            <h3 className="text-xl font-black text-gray-900">Aucun patient correspondant</h3>
            <p className="text-gray-500 mt-2 font-medium">Affinez vos filtres ou vérifiez l'orthographe du nom.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPatients.map((animal) => (
              <Card
                key={animal.id}
                className="group relative overflow-hidden bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer rounded-2xl border border-gray-100 shadow-sm"
                onClick={() => navigate(`/dashboard/vet/patients/${animal.id}`)}
              >
                {/* Species Badge */}
                <div className="absolute top-5 right-5 z-20">
                  <div className="bg-white/90 backdrop-blur-md text-teal-600 shadow-sm border border-white rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]">
                    {animal.species}
                  </div>
                </div>

                {/* Photo Section – static species image */}
                <div className="h-56 w-full bg-gray-100 relative overflow-hidden">
                  <img
                    src={getSpeciesImage(animal.species)}
                    alt={animal.name}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&auto=format&fit=crop' }}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-4 left-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <p className="text-white text-[10px] font-black uppercase tracking-widest">Voir le dossier</p>
                  </div>
                </div>

                {/* Info Content */}
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 group-hover:text-teal-600 transition-colors tracking-tight">{animal.name}</h3>
                      <div className="h-1 w-8 bg-primary/20 group-hover:w-16 group-hover:bg-primary transition-all duration-500 mt-1 rounded-full" />
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-300 dark:text-gray-600 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="grid gap-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-[1rem] bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 group-hover:border-teal-200">
                        <User className="h-4 w-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Maître</p>
                        <p className="font-bold text-gray-700 tracking-tight">{animal.profiles?.full_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-[1rem] bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 group-hover:border-teal-200">
                        <Activity className="h-4 w-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Âge & Génétique</p>
                        <p className="font-bold text-gray-700 tracking-tight">
                          {animal.date_of_birth ? Math.floor((Date.now() - new Date(animal.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : '-'} ans <span className="mx-2 opacity-20">•</span> {animal.breed || 'Race indéterminée'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-50 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="h-3 w-3 text-teal-600/30" />
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
                        {animal.id.substring(0, 8)}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-10 text-teal-600 font-black text-[10px] uppercase tracking-widest hover:bg-teal-50 rounded-xl px-5">
                      Dossier complet
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
