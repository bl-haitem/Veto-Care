import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { MapPin, Search, Star, ArrowRight } from 'lucide-react'
import { WILAYAS } from '@/lib/constants'

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
          id, wilaya, adresse, bio, photo_url, avg_rating,
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

  const getAvatarUrl = (vet) => {
    if (!vet.photo_url) return null
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${vet.photo_url}`
  }

  const renderStars = (rating) => {
    const r = parseFloat(rating) || 0
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.round(r) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Trouver un vétérinaire</h1>
          <p className="text-gray-500 mt-1">Consultez les vétérinaires disponibles et prenez rendez-vous</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterWilaya}
            onChange={(e) => setFilterWilaya(e.target.value)}
            className="flex h-10 w-full sm:w-64 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Toutes les wilayas</option>
            {WILAYAS.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Aucun vétérinaire trouvé</p>
            <p className="text-sm text-gray-400 mt-1">Essayez de modifier vos filtres</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((vet) => (
              <Link key={vet.id} to={`/vets/${vet.id}`}>
                <Card className="p-4 hover:shadow-lg transition-all border-gray-200 hover:border-primary/30 h-full">
                  <div className="flex gap-4">
                    <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 shrink-0">
                      {getAvatarUrl(vet) ? (
                        <img
                          src={getAvatarUrl(vet)}
                          alt={vet.profiles?.full_name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.parentElement.innerHTML = `<div class="flex h-full w-full items-center justify-center text-xl font-bold text-primary">${vet.profiles?.full_name?.charAt(0) || 'V'}</div>`
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl font-bold text-primary">
                          {vet.profiles?.full_name?.charAt(0) || 'V'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{vet.profiles?.full_name}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{vet.wilaya}</span>
                      </div>
                      {vet.adresse && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{vet.adresse}</p>
                      )}
                      <div className="flex items-center gap-1 mt-1.5">
                        {renderStars(vet.avg_rating)}
                        {vet.avg_rating && (
                          <span className="text-xs text-gray-500 ml-1">{parseFloat(vet.avg_rating).toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {vet.bio && (
                    <p className="text-sm text-gray-500 mt-3 line-clamp-2">{vet.bio}</p>
                  )}
                  <div className="mt-3 flex items-center text-sm text-primary font-medium">
                    Voir le profil <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
