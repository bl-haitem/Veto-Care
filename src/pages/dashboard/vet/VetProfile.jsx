import { useState, useEffect } from 'react'
import { useAuth } from '@/context/useAuth'
import { supabase } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { WILAYAS, vetStatusConfig } from '@/lib/constants'
import { Star, Stethoscope } from 'lucide-react'
import { toast } from 'sonner'
import StatusBadge from '@/components/ui/StatusBadge'

export default function VetProfile() {
  const { user, profile, loading: authLoading } = useAuth()
  const [vet, setVet] = useState(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [wilaya, setWilaya] = useState('')
  const [adresse, setAdresse] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    const fetchVet = async () => {
      const { data } = await supabase
        .from('veterinaires')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setVet(data)
      if (data) {
        setAdresse(data.adresse || '')
        setBio(data.bio || '')
        setWilaya(data.wilaya || '')
      }
    }
    fetchVet()
  }, [user])

  // Sync profile fields once loaded
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setPhone(profile.phone || '')
      if (!wilaya) setWilaya(profile.wilaya || '')
    }
  }, [profile])

  const handleSave = async () => {
    if (!user || !vet) return
    setSaving(true)
    try {
      // Update profiles table (full_name, phone, wilaya — all in schema)
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ full_name: fullName, phone, wilaya })
        .eq('id', user.id)
      if (profileErr) throw profileErr

      // Update veterinaires table (adresse, bio, wilaya — all in schema)
      const { error: vetErr } = await supabase
        .from('veterinaires')
        .update({ adresse, bio, wilaya })
        .eq('id', vet.id)
      if (vetErr) throw vetErr

      toast.success('Profil mis à jour avec succès')
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) return <DashboardLayout><p className="p-8">Chargement...</p></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Mon profil vétérinaire</h1>
          <p className="text-gray-600 mt-1">Gérez vos informations professionnelles</p>
        </div>

        {/* Avatar initials card */}
        <Card className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-6 mb-6">
            <div className="h-20 w-20 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700 text-3xl font-black font-heading">
              {fullName?.charAt(0)?.toUpperCase() || 'V'}
            </div>
            <div>
              <h2 className="text-xl font-heading font-semibold text-gray-900">{fullName || 'Vétérinaire'}</h2>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>

          {vet && (
            <div className="flex flex-wrap items-center gap-3 mb-6 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-sm text-gray-500">Statut :</span>
              <StatusBadge status={vet.status} />
              {vet.avg_rating && (
                <span className="text-sm ml-auto flex items-center gap-1 text-yellow-600 font-semibold">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {parseFloat(vet.avg_rating).toFixed(1)}/5
                  {vet.total_reviews && <span className="text-gray-400 font-normal">({vet.total_reviews} avis)</span>}
                </span>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Nom complet</Label>
              <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 h-11 rounded-xl border-gray-200 focus-visible:ring-teal-500" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ''} disabled className="mt-1 h-11 rounded-xl border-gray-200 bg-gray-50" />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 h-11 rounded-xl border-gray-200 focus-visible:ring-teal-500" />
            </div>
            <div>
              <Label htmlFor="wilaya">Wilaya</Label>
              <select
                id="wilaya"
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Sélectionner une wilaya</option>
                {WILAYAS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="adresse">Adresse du cabinet</Label>
              <Input id="adresse" value={adresse} onChange={(e) => setAdresse(e.target.value)} placeholder="Adresse complète" className="mt-1 h-11 rounded-xl border-gray-200 focus-visible:ring-teal-500" />
            </div>
            <div>
              <Label htmlFor="bio">Biographie</Label>
              <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Décrivez votre expérience, spécialités..." rows={4} className="mt-1 resize-none rounded-xl border-gray-200 focus-visible:ring-teal-500" />
            </div>
            <div>
              <Label>Rôle</Label>
              <div className="flex items-center gap-2 mt-1 px-3 py-2 bg-gray-50 rounded-xl text-sm text-gray-600">
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                Vétérinaire
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full h-11 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold">
              {saving ? 'Enregistrement...' : 'Sauvegarder les modifications'}
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
