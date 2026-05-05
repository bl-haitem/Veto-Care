import { useState, useEffect } from 'react'
import { useAuth } from '@/context/useAuth'
import { supabase } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { WILAYAS } from '@/lib/constants'
import { User, Upload } from 'lucide-react'
import { toast } from 'sonner'

export default function OwnerProfile() {
  const { user, profile, loading: authLoading } = useAuth()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [wilaya, setWilaya] = useState('')

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setPhone(profile.phone || '')
      setWilaya(profile.wilaya || '')
    }
  }, [profile])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {


      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, phone, wilaya })
        .eq('id', user.id)

      if (error) throw error
      toast.success('Profil mis à jour')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) return <DashboardLayout><p>Chargement...</p></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-bold font-heading text-gray-900">Mon profil</h1>

        <Card className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            <Avatar className="h-24 w-24 ring-2 ring-white shadow-sm">
              <AvatarFallback className="text-3xl bg-teal-100 text-teal-700 font-heading">
                {fullName?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Nom complet</Label>
              <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-11 rounded-xl border-gray-200 focus-visible:ring-teal-500" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email} disabled className="h-11 rounded-xl border-gray-200 bg-gray-50" />
              <p className="text-xs text-gray-400 mt-1">L&apos;email ne peut pas &ecirc;tre modifi&eacute;</p>
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11 rounded-xl border-gray-200 focus-visible:ring-teal-500" />
            </div>
            <div>
              <Label htmlFor="wilaya">Wilaya</Label>
              <select
                id="wilaya"
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Sélectionner une wilaya</option>
                {WILAYAS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Rôle</Label>
              <div className="flex items-center gap-2 mt-1 px-3 py-2 bg-gray-50 rounded-xl text-sm text-gray-600">
                <User className="h-4 w-4 text-muted-foreground" />
                Propriétaire
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto h-11 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold">
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
