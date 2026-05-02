import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
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
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
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
      let avatarUrl = profile?.avatar_url

      if (avatarFile) {
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(`${user.id}/avatar`, avatarFile, { upsert: true })
        if (error) throw error
        avatarUrl = data?.path ?? ''
      }

      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, phone, wilaya, avatar_url: avatarUrl })
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
        <h1 className="text-2xl font-bold font-heading">Mon profil</h1>

        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarPreview || (profile?.avatar_url ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}` : undefined)} />
              <AvatarFallback className="text-3xl bg-primary text-white">
                {fullName?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-accent text-sm">
                <Upload className="h-4 w-4" />
                Changer la photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setAvatarFile(e.target.files[0])
                      setAvatarPreview(URL.createObjectURL(e.target.files[0]))
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Nom complet</Label>
              <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email} disabled className="bg-gray-50" />
              <p className="text-xs text-gray-400 mt-1">L&apos;email ne peut pas &ecirc;tre modifi&eacute;</p>
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="wilaya">Wilaya</Label>
              <select
                id="wilaya"
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Sélectionner une wilaya</option>
                {WILAYAS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Rôle</Label>
              <div className="flex items-center gap-2 mt-1 px-3 py-2 bg-gray-50 rounded-md text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                Propriétaire
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
