import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Calendar, Clock } from 'lucide-react'
import { TIME_SLOTS } from '@/lib/constants'
import { addDays, addYears, format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function RdvForm({ onSubmit, isLoading = false, pets = [] }) {
  const today = new Date()
  const minDate = format(today, 'yyyy-MM-dd')
  const maxDate = format(addYears(today, 1), 'yyyy-MM-dd')
  const [selectedDate, setSelectedDate] = useState(minDate)
  const [selectedTime, setSelectedTime] = useState(null)
  const [motif, setMotif] = useState('')
  const [selectedPet, setSelectedPet] = useState('')

  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i))

  const handleSubmit = () => {
    onSubmit({
      selectedDate,
      selectedTime,
      motif,
      petId: selectedPet || null,
    })
  }

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <Card className="p-6">
        <h3 className="flex items-center gap-2 font-semibold mb-4">
          <Calendar className="h-5 w-5" />
          Sélectionnez une date
        </h3>
        <div className="mb-4">
          <input
            type="date"
            value={selectedDate || ''}
            min={minDate}
            max={maxDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <p className="text-xs text-gray-500 mt-2">Réservation possible sur toute l'année à venir.</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {next7Days.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd')
            const isSelected = selectedDate === dateStr
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-primary/50'
                  }`}
              >
                <div className="text-2xl font-bold">
                  {format(date, 'd')}
                </div>
                <div className="text-xs text-gray-500">
                  {format(date, 'EEE', { locale: fr })}
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Time Selection */}
      {selectedDate && (
        <Card className="p-6">
          <h3 className="flex items-center gap-2 font-semibold mb-4">
            <Clock className="h-5 w-5" />
            Heure disponible
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {TIME_SLOTS.map((slot) => {
              const isSelected = selectedTime === slot
              return (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={`p-2 rounded-lg border-2 transition-all text-sm font-medium ${isSelected
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-200 hover:border-primary'
                    }`}
                >
                  {slot}
                </button>
              )
            })}
          </div>
        </Card>
      )}

      {/* Pet Selection */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Pour quel animal ? (Optionnel)</h3>
        {pets.length > 0 ? (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setSelectedPet(selectedPet === pet.id ? '' : pet.id)}
                className={`p-3 rounded-lg border-2 text-left flex items-center justify-between transition-all ${selectedPet === pet.id
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-200 hover:border-primary/50'
                  }`}
              >
                <div>
                  <div className="font-semibold">{pet.name}</div>
                  <div className="text-xs text-gray-500">{pet.species}</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Aucun animal enregistré.</p>
        )}
      </Card>

      {/* Reason */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Motif de la consultation</h3>
        <Textarea
          placeholder="Décrivez les symptômes ou la raison de votre visite..."
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          className="min-h-24 resize-none"
        />
      </Card>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!selectedDate || !selectedTime || !motif.trim() || isLoading}
        className="w-full h-12 font-bold"
      >
        {isLoading ? 'Réservation en cours...' : 'Réserver le rendez-vous'}
      </Button>
    </div>
  )
}
