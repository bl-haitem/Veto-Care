import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import AuthLayout from '@/components/layout/AuthLayout'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Clock, MapPin, Building, LogIn } from 'lucide-react'
import { vetStatusConfig } from '@/lib/constants'
import { toast } from 'sonner'

export default function PendingPage() {
  const navigate = useNavigate()
  const [vet, setVet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    let channel = null

    const fetchVet = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const uid = user?.id

      if (!uid) {
        setLoading(false)
        return
      }

      setUserId(uid)

      const { data } = await supabase
        .from('veterinaires')
        .select('*')
        .eq('user_id', uid)
        .single()

      setVet(data)
      setLoading(false)

      if (data?.status === 'approved') {
        toast.success('Votre compte a été approuvé!')
        navigate('/auth/login')
        return
      }
      if (data?.status === 'rejected') {
        toast.error('Votre compte a été refusé.')
        return
      }

      channel = supabase
        .channel('vet-status')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'veterinaires',
          filter: `user_id=eq.${uid}`
        }, (payload) => {
          if (payload.new.status === 'approved') {
            toast.success('Votre compte a été approuvé! Connectez-vous.')
            navigate('/auth/login')
          }
          if (payload.new.status === 'rejected') {
            toast.error('Votre compte a été refusé.')
          }
          setVet(payload.new)
        })
        .subscribe()
    }

    fetchVet()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [navigate])

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
          <Clock className="h-8 w-8 text-yellow-600" />
        </div>
        <h2 className="text-xl font-bold font-heading">Compte en cours de vérification</h2>
        <p className="text-gray-500 text-sm mt-2">
          Votre demande est en cours d&apos;examen par notre équipe.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ) : vet ? (
        <>
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Statut</span>
              <Badge className={vetStatusConfig[vet.status]?.className}>
                {vetStatusConfig[vet.status]?.label}
              </Badge>
            </div>

            {vet.photo_url && (
              <div>
                <span className="text-sm text-gray-500">Photo</span>
                <div className="mt-1 h-20 w-20 rounded-full overflow-hidden bg-gray-100">
                  <img
                    src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${vet.photo_url}`}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{vet.wilaya}</span>
            </div>

            {vet.adresse && (
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{vet.adresse}</span>
              </div>
            )}
          </Card>

          {!userId && (
            <Button onClick={() => navigate('/auth/login')} className="w-full mt-4">
              <LogIn className="h-4 w-4 mr-2" />
              Se connecter
            </Button>
          )}
        </>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-gray-500">Aucune demande trouvée.</p>
          <Button onClick={() => navigate('/auth/register')} className="mt-4">
            Créer un compte
          </Button>
        </Card>
      )}
    </AuthLayout>
  )
}
