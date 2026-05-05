import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, XCircle, ExternalLink, ShieldCheck, MapPin, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { vetStatusConfig } from '@/lib/constants'

export default function VetVerification() {
  const [vets, setVets] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)

  useEffect(() => {
    const fetchPendingVets = async () => {
      try {
        const { data, error } = await supabase
          .from('veterinaires')
          .select(`
            *,
            profiles!veterinaires_user_id_fkey ( full_name, phone, email )
          `)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setVets(data || [])
      } catch (error) {
        console.error('Error fetching pending vets:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPendingVets()
  }, [])

  const handleAction = async (id, newStatus) => {
    setProcessing(id)
    try {
      const { error } = await supabase
        .from('veterinaires')
        .update({ status: newStatus })
        .eq('id', id)
      
      if (error) throw error
      
      setVets(vets.filter(v => v.id !== id))
      toast.success(newStatus === 'approved' ? 'Vétérinaire approuvé !' : 'Vétérinaire refusé.')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setProcessing(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Vérification Vétérinaires</h1>
          <p className="text-gray-500 mt-1">Approuvez ou refusez les nouvelles inscriptions de praticiens</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
          </div>
        ) : vets.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <ShieldCheck className="h-12 w-12 text-teal-100 mx-auto mb-4" />
            <p className="text-gray-500">Aucun vétérinaire en attente de vérification</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {vets.map((vet) => (
              <Card key={vet.id} className="p-6 border-none shadow-sm bg-white overflow-hidden relative">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Vet Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                          {vet.profiles?.full_name?.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{vet.profiles?.full_name}</h3>
                          <Badge variant="secondary" className={vetStatusConfig.pending.className}>
                            En attente de vérification
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        <span>{vet.wilaya} {vet.adresse && `• ${vet.adresse}`}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Phone className="h-4 w-4" />
                        <span>{vet.profiles?.phone}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Biographie</p>
                      <p className="text-sm text-gray-600 line-clamp-2 italic">"{vet.bio || 'Aucune biographie fournie.'}"</p>
                    </div>
                  </div>

                  {/* Documents & Actions */}
                  <div className="w-full md:w-64 flex flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                    <Button variant="outline" className="w-full justify-between" asChild>
                      <a href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/carnets/${vet.document_url}`} target="_blank" rel="noreferrer">
                        Voir la licence
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        className="text-red-600 border-red-100 hover:bg-red-50"
                        onClick={() => handleAction(vet.id, 'rejected')}
                        disabled={processing === vet.id}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Refuser
                      </Button>
                      <Button 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleAction(vet.id, 'approved')}
                        disabled={processing === vet.id}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approuver
                      </Button>
                    </div>
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
