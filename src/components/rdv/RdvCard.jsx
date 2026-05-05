import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, X } from 'lucide-react'
import { rdvStatusConfig } from '@/lib/constants'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function RdvCard({ rdv, isOwnerView = false, onCancel, onConfirm, isLoading = false }) {
  const getVetName = () => {
    if (isOwnerView) {
      return rdv.veterinaires?.profiles?.full_name || 'Vétérinaire'
    }
    return rdv.profiles?.full_name || 'Propriétaire'
  }

  const statusConfig = rdvStatusConfig[rdv.status] || {}

  return (
    <Card className="p-4 hover:shadow-md transition-all">
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">
              {isOwnerView ? 'Dr. ' : ''}{getVetName()}
            </h3>
            <Badge className={statusConfig.className || ''}>
              {statusConfig.label || rdv.status}
            </Badge>
          </div>

          <div className="space-y-1.5 text-sm text-gray-500">
            {rdv.veterinaires?.adresse && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{rdv.veterinaires.adresse}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(rdv.date_rdv), 'dd MMMM yyyy', { locale: fr })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{rdv.heure_rdv?.substring(0, 5)}</span>
            </div>
            {rdv.motif && (
              <p className="text-gray-600 mt-2"><strong>Motif:</strong> {rdv.motif}</p>
            )}
            {rdv.pet && (
              <p className="text-gray-600"><strong>Animal:</strong> {rdv.pet.name} ({rdv.pet.species})</p>
            )}
          </div>

          {rdv.notes_vet && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
              <p className="text-blue-800"><strong>Notes:</strong> {rdv.notes_vet}</p>
            </div>
          )}
        </div>
      </div>

      {(onCancel || onConfirm) && (
        <div className="mt-4 flex gap-2 justify-end">
          {rdv.status === 'pending' && onConfirm && !isOwnerView && (
            <Button
              size="sm"
              onClick={() => onConfirm(rdv.id, 'confirmed')}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirmer
            </Button>
          )}
          {rdv.status !== 'cancelled' && rdv.status !== 'done' && onCancel && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCancel(rdv.id)}
              disabled={isLoading}
              className="text-red-600 hover:text-red-700 hover:border-red-300"
            >
              <X className="h-4 w-4 mr-1" />
              Annuler
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}
