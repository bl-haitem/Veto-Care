import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/context/useAuth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Clock, Calendar, Save } from 'lucide-react'

const DAYS = [
  { id: 'mon', label: 'Lundi' },
  { id: 'tue', label: 'Mardi' },
  { id: 'wed', label: 'Mercredi' },
  { id: 'thu', label: 'Jeudi' },
  { id: 'fri', label: 'Vendredi' },
  { id: 'sat', label: 'Samedi' },
  { id: 'sun', label: 'Dimanche' },
]

export default function VetAvailability() {
  const { user } = useAuth()
  const [workingDays, setWorkingDays] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    const fetchAvailability = async () => {
      try {
        const { data } = await supabase
          .from('veterinaires')
          .select('disponibilites')
          .eq('user_id', user.id)
          .single()
        
        setWorkingDays(data?.disponibilites || [])
      } catch (error) {
        console.error('Error fetching availability:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAvailability()
  }, [user])

  const toggleDay = (dayId) => {
    setWorkingDays(prev => 
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('veterinaires')
        .update({ disponibilites: workingDays })
        .eq('user_id', user.id)
      
      if (error) throw error
      toast.success('Disponibilités mises à jour !')
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-10 focus-visible:outline-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black font-heading text-gray-900 dark:text-white tracking-tight">Horaires & Disponibilités</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Configurez votre calendrier de consultation intelligent</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="flex items-center gap-3 rounded-[1.25rem] h-14 px-8 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 font-black transition-all hover:scale-105 active:scale-95 group">
            <Save className="h-5 w-5 group-hover:rotate-12 transition-transform" />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer mon planning'}</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <Card className="lg:col-span-2 p-10 bg-white dark:bg-slate-900 border-none shadow-2xl dark:shadow-none rounded-[3rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
               <Calendar size={180} className="text-primary" />
            </div>
            
            <h3 className="font-black text-gray-900 dark:text-white mb-10 flex items-center gap-4 text-2xl tracking-tight relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center">
                 <Calendar className="h-6 w-6 text-primary" />
              </div>
              Jours d'ouverture
            </h3>
            
            <div className="grid gap-4 relative z-10">
              {DAYS.map((day) => (
                <div 
                  key={day.id} 
                  className={`flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all duration-500 group/day cursor-pointer hover:shadow-lg ${
                    workingDays.includes(day.id) 
                      ? 'bg-teal-50/30 dark:bg-teal-500/5 border-teal-100 dark:border-teal-500/20' 
                      : 'bg-white dark:bg-slate-900 border-gray-50 dark:border-slate-800'
                  }`}
                  onClick={() => toggleDay(day.id)}
                >
                  <div className="flex items-center gap-6">
                    <div className={`h-8 w-8 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${
                       workingDays.includes(day.id)
                       ? 'bg-primary border-primary shadow-lg shadow-primary/20'
                       : 'bg-transparent border-gray-200 dark:border-slate-700'
                    }`}>
                       {workingDays.includes(day.id) && <Save className="h-4 w-4 text-white" />}
                    </div>
                    <span className={`font-black text-xl tracking-tight transition-colors ${
                      workingDays.includes(day.id) ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-slate-700'
                    }`}>{day.label}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-opacity ${
                      workingDays.includes(day.id) ? 'opacity-100 text-primary' : 'opacity-0'
                    }`}>Disponible</span>
                    <div className={`h-10 w-24 rounded-full flex items-center justify-center transition-all duration-500 ${
                       workingDays.includes(day.id) 
                       ? 'bg-primary text-white font-black text-[10px] uppercase tracking-widest' 
                       : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 font-bold text-[10px] uppercase tracking-widest'
                    }`}>
                       {workingDays.includes(day.id) ? 'Ouvert' : 'Fermé'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-6">
             <Card className="p-10 bg-white dark:bg-slate-900 border-none shadow-2xl dark:shadow-none rounded-[3rem] h-fit sticky top-24 overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                  <Clock size={120} className="text-primary" />
               </div>
               
               <h3 className="font-black text-gray-900 dark:text-white mb-8 flex items-center gap-4 text-2xl tracking-tight relative z-10">
                 <div className="h-12 w-12 rounded-2xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                 </div>
                 Amplitudes
               </h3>
               
               <p className="text-sm text-gray-500 dark:text-gray-400 mb-10 leading-relaxed font-medium relative z-10">
                 Vos horaires de consultation par défaut s'appliquent à tous les jours activés.
               </p>
               
               <div className="space-y-5 relative z-10">
                 {[
                   { label: "Matinée", time: "08:00 - 12:00", active: true },
                   { label: "Après-midi", time: "13:00 - 17:00", active: true }
                 ].map((slot, i) => (
                   <div key={i} className="p-6 bg-gray-50 dark:bg-slate-800/50 rounded-[2rem] border border-transparent hover:border-primary/20 transition-all group/slot">
                     <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{slot.label}</span>
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                     </div>
                     <span className="font-black text-gray-900 dark:text-white text-2xl tracking-tighter group-hover/slot:text-primary transition-colors">{slot.time}</span>
                   </div>
                 ))}
               </div>
               
               <Button variant="ghost" className="w-full mt-10 text-primary font-black text-xs uppercase tracking-[0.2em] hover:bg-teal-50 dark:hover:bg-teal-500/10 rounded-2xl h-14 border border-transparent hover:border-teal-100 transition-all">
                 Éditer les tranches
               </Button>
             </Card>

             <Card className="p-8 bg-primary/10 dark:bg-primary/5 border border-primary/10 dark:border-primary/20 rounded-[2rem]">
                <div className="flex gap-4">
                   <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                      <Save className="h-5 w-5 text-primary" />
                   </div>
                   <div>
                      <h4 className="font-black text-gray-900 dark:text-white text-sm">Synchronisation Auto</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium leading-relaxed">Vos changements sont appliqués immédiatement sur votre profil public.</p>
                   </div>
                </div>
             </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
