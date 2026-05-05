import { Card } from '@/components/ui/card'
import { Search } from 'lucide-react'
import VetCard from './VetCard'

export default function VetList({ vets, loading, isFiltered }) {
  if (loading) {
    return (
      <div className="grid gap-4 md:gap-6 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-44 w-full rounded-2xl bg-gray-200 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!vets || vets.length === 0) {
    return (
      <Card className="p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
        <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-gray-500 font-medium">
          {isFiltered ? 'Aucun vétérinaire trouvé' : 'Aucun vétérinaire disponible'}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {isFiltered ? 'Essayez de modifier vos filtres' : 'Veuillez réessayer plus tard'}
        </p>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:gap-6 sm:grid-cols-2">
      {vets.map((vet) => (
        <VetCard key={vet.id} vet={vet} />
      ))}
    </div>
  )
}
