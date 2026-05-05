import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { MapPin, Star, ArrowRight } from 'lucide-react'

export default function VetCard({ vet }) {
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
    <Link to={`/vets/${vet.id}`}>
      <Card className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full">
        <div className="flex gap-4">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-teal-100 shrink-0 ring-2 ring-white">
            <div className="flex h-full w-full items-center justify-center text-xl font-heading font-bold text-teal-700">
              {vet.profiles?.full_name?.charAt(0) || 'V'}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold text-gray-900 truncate">{vet.profiles?.full_name}</h3>
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
        <div className="mt-3 flex items-center text-sm text-teal-600 font-medium">
          Voir le profil <ArrowRight className="h-4 w-4 ml-1" />
        </div>
      </Card>
    </Link>
  )
}
