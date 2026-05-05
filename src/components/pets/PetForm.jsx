import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Upload, X } from 'lucide-react'
import { SPECIES, getSpeciesImage } from '@/lib/constants'

// Normalize species capitalization to match SPECIES list
const normalizeSpecies = (s) =>
  s ? s.charAt(0).toUpperCase() + s.toLowerCase().slice(1) : ''

export default function PetForm({ onSubmit, isLoading = false, initialData = null }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    species: normalizeSpecies(initialData?.species) || '',
    breed: initialData?.breed || '',
    gender: initialData?.gender || '',
    date_of_birth: initialData?.date_of_birth || '',
    notes: initialData?.notes || '',
    // medical document (goes to pet_carnets, not pets table)
    medicalFile: null,
    medicalTitle: '',
  })

  const [fileName, setFileName] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFormData((prev) => ({ ...prev, medicalFile: file }))
    setFileName(file.name)
  }

  const clearFile = () => {
    setFormData((prev) => ({ ...prev, medicalFile: null, medicalTitle: '' }))
    setFileName(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const speciesImg = formData.species ? getSpeciesImage(formData.species) : null

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Informations générales ── */}
      <Card className="p-6 space-y-4">
        <p className="text-base font-semibold text-gray-800">Informations de l&apos;animal</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Nom */}
          <div>
            <Label htmlFor="name" className="text-sm font-medium">Nom *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              autoFocus
              className="mt-1"
            />
          </div>

          {/* Espèce */}
          <div>
            <Label htmlFor="species" className="text-sm font-medium">Espèce *</Label>
            <div className="flex items-center gap-3 mt-1">
              {speciesImg && (
                <img
                  src={speciesImg}
                  alt={formData.species}
                  className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-md shrink-0"
                />
              )}
              <select
                id="species"
                name="species"
                value={formData.species}
                onChange={handleInputChange}
                required
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Sélectionner une espèce</option>
                {SPECIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Race */}
          <div>
            <Label htmlFor="breed" className="text-sm font-medium">Race</Label>
            <Input id="breed" name="breed" value={formData.breed} onChange={handleInputChange} className="mt-1" />
          </div>

          {/* Sexe */}
          <div>
            <Label htmlFor="gender" className="text-sm font-medium">Sexe</Label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
            >
              <option value="">Sélectionner le sexe</option>
              <option value="male">Mâle</option>
              <option value="female">Femelle</option>
            </select>
          </div>

          {/* Date de naissance */}
          <div>
            <Label htmlFor="date_of_birth" className="text-sm font-medium">Date de naissance</Label>
            <Input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>

        </div>
      </Card>

      {/* ── Dossier médical (pet_carnets) ── */}
      <Card className="p-6 space-y-4">
        <p className="text-base font-semibold text-gray-800">Dossier médical</p>

        {/* Titre du document */}
        <div>
          <Label htmlFor="medicalTitle" className="text-sm font-medium">Titre du document</Label>
          <Input
            id="medicalTitle"
            name="medicalTitle"
            value={formData.medicalTitle}
            onChange={handleInputChange}
            placeholder="Ex: Carnet de vaccination, Ordonnance…"
            className="mt-1"
          />
        </div>

        {/* Upload */}
        <div>
          <Label className="text-sm font-medium">Fichier médical</Label>
          {fileName ? (
            <div className="mt-2 flex items-center gap-3 p-3 bg-teal-50 border border-teal-200 rounded-xl">
              <div className="h-10 w-10 bg-[#14a38b] rounded-lg flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-teal-800 truncate">{fileName}</p>
                <p className="text-xs text-teal-600">Prêt à être envoyé</p>
              </div>
              <button type="button" onClick={clearFile} className="p-1 hover:bg-teal-100 rounded-full transition-colors">
                <X className="h-4 w-4 text-teal-700" />
              </button>
            </div>
          ) : (
            <label
              className="mt-2 flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#14a38b] hover:bg-teal-50/50 transition-all"
            >
              <Upload className="h-8 w-8 text-gray-400" />
              <span className="text-sm font-medium text-gray-500">Cliquez pour sélectionner un fichier</span>
              <span className="text-xs text-gray-400">PDF, DOC, DOCX, JPG, PNG</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                onChange={handleFileChange}
                tabIndex={-1}
                className="hidden"
              />
            </label>
          )}
        </div>
      </Card>

      {/* ── Notes ── */}
      <Card className="p-6">
        <Label htmlFor="notes" className="text-sm font-medium block mb-2">Notes supplémentaires</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          className="min-h-24 resize-none"
          placeholder="Allergies, comportement, informations importantes…"
        />
      </Card>

      <Button type="submit" disabled={isLoading} className="w-full h-12 font-bold">
        {isLoading ? 'Enregistrement…' : initialData ? "Modifier l'animal" : "Ajouter l'animal"}
      </Button>

    </form>
  )
}
