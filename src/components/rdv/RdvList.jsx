import { Card } from '@/components/ui/card'
import { Calendar } from 'lucide-react'
import RdvCard from './RdvCard'

export default function RdvList({ rdvs, loading, isOwnerView = false, onCancel, onConfirm, isLoading = false, emptyMessage = "Aucun rendez-vous" }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 w-full rounded-lg bg-gray-200 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!rdvs || rdvs.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-gray-500 font-medium">{emptyMessage}</p>
        <p className="text-sm text-gray-400 mt-1">
          {isOwnerView ? 'Prenez rendez-vous avec un vétérinaire' : 'Vous recevrez les demandes des propriétaires'}
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {rdvs.map((rdv) => (
        <RdvCard
          key={rdv.id}
          rdv={rdv}
          isOwnerView={isOwnerView}
          onCancel={onCancel}
          onConfirm={onConfirm}
          isLoading={isLoading}
        />
      ))}
    </div>
  )
}
