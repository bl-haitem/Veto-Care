import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/context/useAuth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Clock,
  Stethoscope,
  ArrowRight,
  PawPrint,
  Heart,
  ChevronRight,
  User
} from 'lucide-react'
import { rdvStatusConfig, getSpeciesImage } from '@/lib/constants'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function OwnerDashboard() {
  const { user, profile } = useAuth()
  const [upcoming, setUpcoming] = useState([])
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      const today = new Date().toISOString().split('T')[0]

      // Fetch appointments
      const { data: appts } = await supabase
        .from('rendez_vous')
        .select(`
          id, date_rdv, heure_rdv, motif, status,
          pet:pets!rendez_vous_pet_id_fkey(id, name, species, photo_url),
          veterinaires (
            id, wilaya, adresse,
            profiles!veterinaires_user_id_fkey ( full_name )
          )
        `)
        .eq('maitre_id', user.id)
        .in('status', ['pending', 'confirmed'])
        .gte('date_rdv', today)
        .order('date_rdv', { ascending: true })
        .limit(3)

      // Fetch pets
      const { data: animalList } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user.id)
        .limit(5)

      setUpcoming(appts || [])
      setPets(animalList || [])
      setLoading(false)
    }
    fetchData()
  }, [user])

  const getVetName = (rdv) => rdv.veterinaires?.profiles?.full_name || 'Vétérinaire'

  const healthTips = [
    {
      title: "L'importance de l'hydratation",
      text: "Assurez-vous que votre animal a toujours de l'eau fraîche, surtout en été.",
      icon: Heart
    },
    {
      title: "Vaccination annuelle",
      text: "N'oubliez pas le rappel annuel pour protéger votre compagnon.",
      icon: Stethoscope
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Welcome Section */}
        <section className="relative overflow-hidden rounded-2xl p-8 md:p-12 bg-gradient-to-br from-teal-600 to-teal-700 text-white">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-heading">
                Bonjour, {profile?.full_name?.split(' ')[0]} 👋
              </h1>
              <p className="text-teal-50 mt-2 text-lg max-w-md">
                Gérez la santé de vos animaux en toute simplicité sur Veto Care.
              </p>
            </div>
            <Link to="/vets">
              <Button className="bg-white text-teal-700 hover:bg-teal-50 rounded-xl px-6 h-12 font-bold shadow-lg">
                <Calendar className="h-5 w-5 mr-2" />
                Prendre RDV
              </Button>
            </Link>
          </div>
          {/* Abstract decoration */}
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 translate-y-1/2 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl" />
          <PawPrint className="absolute right-8 bottom-8 h-32 w-32 text-white/5 -rotate-12" />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Upcoming Appointments */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-heading text-gray-900">Prochains Rendez-vous</h2>
              <Link to="/dashboard/owner/appointments" className="text-sm font-semibold text-teal-600 hover:underline flex items-center gap-1 group">
                Tout voir <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
              </div>
            ) : upcoming.length === 0 ? (
              <Card className="p-10 text-center bg-white border-dashed border-2 rounded-2xl border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-900">Aucun rendez-vous</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-[200px] mx-auto">
                  Prêt pour une consultation ? Trouvez un véto maintenant.
                </p>
                <Link to="/vets">
                  <Button className="mt-6 bg-teal-600 hover:bg-teal-700 rounded-xl px-6">Trouver un vétérinaire</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcoming.map((rdv) => (
                  <Card key={rdv.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                        <User className="h-6 w-6 text-teal-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 truncate">Dr. {getVetName(rdv)}</h4>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-teal-600" />
                            {format(new Date(rdv.date_rdv), 'EEEE d MMMM', { locale: fr })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-teal-600" />
                            {rdv.heure_rdv?.substring(0, 5)}
                          </span>
                          {rdv.pet && (
                            <span className="flex items-center gap-1 ml-2 font-medium text-gray-700">
                              🐾 {rdv.pet.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`${rdvStatusConfig[rdv.status]?.className} inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border`}>
                        {rdvStatusConfig[rdv.status]?.label}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Health Tips */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold font-heading text-gray-900">Conseils Santé</h2>
            <div className="space-y-4">
              {healthTips.map((tip, idx) => (
                <Card key={idx} className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md overflow-hidden relative group">
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0 text-[#f59e0b]">
                      <tip.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{tip.title}</h4>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{tip.text}</p>

                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700" />
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* My Pets Carousel Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-heading text-gray-900">Mes Animaux</h2>
            <Link to="/dashboard/owner/pets" className="text-sm font-semibold text-teal-600 hover:underline">
              Gérer mes animaux
            </Link>
          </div>

          {loading ? (
            <div className="flex gap-6 overflow-hidden">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-64 shrink-0 rounded-2xl" />)}
            </div>
          ) : pets.length === 0 ? (
            <Card className="p-12 text-center bg-white border-dashed border-2 rounded-2xl border-gray-100">
              <PawPrint className="h-16 w-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900">Pas encore d'animaux ?</h3>
              <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                Ajoutez vos compagnons pour suivre leur santé et prendre des rendez-vous plus rapidement.
              </p>
              <Button className="mt-8 bg-teal-600 hover:bg-teal-700 rounded-xl px-8 h-12 font-bold shadow-lg shadow-teal-100">
                Ajouter un animal
              </Button>
            </Card>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4">
              {pets.map((pet) => (
                <Card key={pet.id} className="min-w-[280px] group rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                  <div className="h-40 relative overflow-hidden rounded-t-2xl">
                    <img
                      src={getSpeciesImage(pet.species)}
                      alt={pet.name}
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&auto=format&fit=crop' }}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-xl text-teal-600 shadow-sm">
                      <Heart className="h-4 w-4 fill-current" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                      <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider">{pet.species}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-gray-900">{pet.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{pet.species} • {pet.date_of_birth ? Math.floor((new Date() - new Date(pet.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000)) : '-'} ans</p>

                    <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-teal-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-teal-600">MD</div>
                        <div className="w-8 h-8 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-yellow-600">VC</div>
                      </div>
                      <Link to={`/vets`}>
                        <Button variant="ghost" size="sm" className="text-teal-600 hover:bg-teal-50 rounded-lg group/btn">
                          Réserver <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}

