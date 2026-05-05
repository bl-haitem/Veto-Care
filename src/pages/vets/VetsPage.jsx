import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { WILAYAS } from '@/lib/constants'
import VetList from '@/components/vets/VetList'

export default function VetsPage() {
  const [vets, setVets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterWilaya, setFilterWilaya] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchVets = async () => {
      const { data } = await supabase
        .from('veterinaires')
        .select(`
          id, wilaya, adresse, bio, avg_rating,
          profiles!veterinaires_user_id_fkey ( full_name )
        `)
        .eq('status', 'approved')
        .order('avg_rating', { ascending: false })

      setVets(data || [])
      setLoading(false)
    }
    fetchVets()
  }, [])

  const filtered = vets.filter((vet) => {
    const matchWilaya = !filterWilaya || vet.wilaya === filterWilaya
    const matchSearch = !searchQuery ||
      vet.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchWilaya && matchSearch
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Trouver un vétérinaire</h1>
          <p className="text-gray-600 mt-1">Consultez les vétérinaires disponibles et prenez rendez-vous</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl border-gray-200 focus-visible:ring-teal-500"
            />
          </div>
          <select
            value={filterWilaya}
            onChange={(e) => setFilterWilaya(e.target.value)}
            className="flex h-11 w-full sm:w-64 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Toutes les wilayas</option>
            {WILAYAS.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        {/* Results */}
        <VetList vets={filtered} loading={loading} isFiltered={!!filterWilaya || !!searchQuery} />
      </div>
    </DashboardLayout>
  )
}
