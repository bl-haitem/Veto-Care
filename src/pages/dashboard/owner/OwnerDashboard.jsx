import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, Stethoscope, ArrowRight } from 'lucide-react'
import { rdvStatusConfig } from '@/lib/constants'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function OwnerDashboard() {
  const { user, profile } = useAuth()
  const [upcoming, setUpcoming] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      const today = new Date().toISOString().split('T')[0]

      const { data } = await supabase
        .from('rendez_vous')
        .select(`
          id, date_rdv, heure_rdv, motif, status,
          veterinaires (
            id, wilaya, adresse, photo_url,
            profiles!veterinaires_user_id_fkey ( full_name )
          )
        `)
        .eq('maitre_id', user.id)
        .in('status', ['en_attente', 'confirme'])
        .gte('date_rdv', today)
        .order('date_rdv', { ascending: true })
        .limit(5)

      setUpcoming(data || [])
      setLoading(false)
    }
    fetchData()
  }, [user])

  const getVetName = (rdv) => rdv.veterinaires?.profiles?.full_name || 'Vétérinaire'
  const getVetWilaya = (rdv) => rdv.veterinaires?.wilaya || ''
  const getVetAdresse = (rdv) => rdv.veterinaires?.adresse || ''

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold font-heading">
            Bonjour, {profile?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">Gérez la santé de votre animal en toute simplicité</p>
        </div>

        {/* CTA */}
        <Link to="/vets">
          <Card className="p-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer border-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Prendre un rendez-vous</h3>
                <p className="text-teal-100 text-sm mt-1">Trouvez un vétérinaire près de chez vous</p>
              </div>
              <Stethoscope className="h-10 w-10 opacity-80" />
            </div>
          </Card>
        </Link>

        {/* Upcoming Appointments */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold font-heading">Prochains rendez-vous</h2>
            <Link to="/dashboard/owner/appointments" className="text-sm text-primary hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Aucun rendez-vous à venir</p>
              <p className="text-sm text-gray-400 mt-1">Prenez votre premier rendez-vous dès maintenant</p>
              <Link to="/vets">
                <Button className="mt-4">Trouver un vétérinaire</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcoming.map((rdv) => (
                <Card key={rdv.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                        {getVetName(rdv).charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{getVetName(rdv)}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(rdv.date_rdv), 'dd MMM yyyy', { locale: fr })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {rdv.heure_rdv?.substring(0, 5)}
                          </span>
                        </div>
                        {getVetWilaya(rdv) && (
                          <span className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                            <MapPin className="h-3 w-3" />
                            {getVetWilaya(rdv)} {getVetAdresse(rdv) && `• ${getVetAdresse(rdv)}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge className={rdvStatusConfig[rdv.status]?.className}>
                      {rdvStatusConfig[rdv.status]?.label}
                    </Badge>
                  </div>
                  {rdv.motif && (
                    <p className="text-sm text-gray-500 mt-2 pl-16">Motif : {rdv.motif}</p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
