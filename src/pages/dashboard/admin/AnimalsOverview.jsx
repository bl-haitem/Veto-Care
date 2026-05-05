import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, PawPrint, User, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function AnimalsOverview() {
  const [animals, setAnimals] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const { data, error } = await supabase
          .from('pets')
          .select(`
            *,
            profiles!pets_owner_id_fkey ( full_name )
          `)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setAnimals(data || [])
      } catch (error) {
        console.error('Error fetching animals:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnimals()
  }, [])

  const filteredAnimals = animals.filter(animal => 
    (animal.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (animal.species || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet animal ?')) return
    try {
      const { error } = await supabase.from('pets').delete().eq('id', id)
      if (error) throw error
      setAnimals(animals.filter(a => a.id !== id))
      toast.success('Animal supprimé')
    } catch (error) {
      toast.error('Erreur')
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Animaux du Système</h1>
          <p className="text-gray-500 mt-1">Consultez tous les animaux enregistrés sur la plateforme</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Rechercher par nom, espèce ou propriétaire..." 
            className="pl-10 bg-white border-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 6].map(i => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnimals.map((animal) => (
              <Card key={animal.id} className="p-5 border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-full bg-teal-50 flex items-center justify-center text-primary">
                    <PawPrint className="h-7 w-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{animal.name}</h3>
                    <Badge variant="secondary" className="bg-teal-50 text-primary border-none text-[10px] px-2">
                      {animal.species}
                    </Badge>
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-gray-300 hover:text-red-600"
                    onClick={() => handleDelete(animal.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2 pt-4 border-t border-gray-50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Propriétaire</span>
                    <span className="font-medium text-gray-700 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {animal.profiles?.full_name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Âge</span>
                    <span className="font-medium text-gray-700">{animal.date_of_birth ? Math.floor((new Date() - new Date(animal.date_of_birth))/(365.25*24*60*60*1000)) : '-'} ans</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Race</span>
                    <span className="font-medium text-gray-700 truncate max-w-[120px]">{animal.breed || '-'}</span>
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
