import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PawPrint, Trash2, Edit, Info, FileText } from 'lucide-react'
import { getSpeciesImage } from '@/lib/constants'

export default function PetCard({ animal, onDelete }) {
  const coverImage = getSpeciesImage(animal.species)

  return (
    <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-500 border-none bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none">
      <div className="h-56 bg-gray-100 dark:bg-slate-800 relative overflow-hidden">
        <img
          src={coverImage}
          alt={animal.name}
          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {animal.photo_url && (
            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 text-[#14a38b] font-bold uppercase tracking-widest text-xs border border-white/50">
              <FileText className="h-4 w-4" />
              Dossier joint
            </div>
          )}
        </div>
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
          <Button size="icon" variant="secondary" className="h-10 w-10 rounded-xl shadow-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md dark:text-white dark:hover:bg-primary transition-all">
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            className="h-10 w-10 rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all"
            onClick={() => onDelete && onDelete(animal.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-white text-xs font-black uppercase tracking-[0.2em]">{animal.species}</p>
          <h3 className="text-white text-2xl font-black font-heading mt-1">{animal.name}</h3>
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20 text-[10px] font-black text-primary uppercase tracking-widest">
              {animal.date_of_birth ? `${Math.floor((new Date() - new Date(animal.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000))} ans` : 'Âge ?'}
            </div>
            <div className="px-3 py-1 rounded-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Actif
            </div>
          </div>
        </div>
        <Link to={`/dashboard/owner/pets/${animal.id}`}>
          <Button variant="outline" className="w-full h-12 rounded-2xl flex items-center gap-3 font-bold dark:border-slate-800 dark:text-gray-300 dark:hover:bg-primary dark:hover:text-white transition-all group-hover:bg-primary group-hover:text-white group-hover:border-primary">
            <Info className="h-4 w-4" />
            <span>Détails & Carnet</span>
          </Button>
        </Link>
      </div>
    </Card>
  )
}
