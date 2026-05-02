import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import AuthLayout from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { WILAYAS } from '@/lib/constants'
import { User, Stethoscope, Upload, Check } from 'lucide-react'
import { toast } from 'sonner'

const registerSchema = z.object({
  full_name: z.string().min(3, 'Nom requis'),
  phone: z.string().min(9, 'Téléphone invalide'),
  wilaya: z.string().min(1, 'Wilaya requise'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  role: z.enum(['maitre', 'veterinaire']),
  adresse: z.string().optional(),
  bio: z.string().optional(),
})

export default function RegisterPage() {
  const navigate = useNavigate()
  const { user, profile, loading } = useAuth()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState(null)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [photoFile, setPhotoFile] = useState(null)
  const [documentFile, setDocumentFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)

  // منع المستخدم المسجل من الوصول لصفحة التسجيل
  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === 'veterinaire') {
        navigate('/dashboard/vet', { replace: true })
      } else if (profile.role === 'maitre') {
        navigate('/dashboard/owner', { replace: true })
      }
    }
  }, [user, profile, loading, navigate])

  if (!loading && user && profile) return null;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'maitre' },
  })

  const currentRole = watch('role')

  const handleRoleSelect = (r) => {
    setRole(r)
    setValue('role', r, { shouldValidate: true, shouldDirty: true })
    setStep(2)
  }

  const onCommonSubmit = async (data) => {
    if (data.role === 'maitre') {
      await onSubmit(data)
    } else {
      setStep(3)
    }
  }

  const onSubmit = async (values) => {
    try {
      setLoadingSubmit(true)

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { data: { full_name: values.full_name, role: values.role } }
      })

      if (authError) throw authError
      const userId = authData.user?.id
      if (!userId) throw new Error('No user ID returned')

      // ✅ كل العمليات هنا قبل signOut — المستخدم لازال authenticated

      // 1. Insert profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: values.full_name,
          phone: values.phone,
          wilaya: values.wilaya,
          role: values.role,
        })
      if (profileError) throw profileError

      // 2. إذا بيطري — ارفع الملفات وأنشئ السجل
      if (values.role === 'veterinaire') {
        let document_url = null
        let photo_url = null

        if (documentFile) {
          const ext = documentFile.name.split('.').pop()
          const { data: doc, error: docErr } = await supabase.storage
            .from('carnets')
            .upload(`${userId}/license.${ext}`, documentFile, { upsert: true })
          if (docErr) throw docErr
          document_url = doc?.path || null
        }

        if (photoFile) {
          const ext = photoFile.name.split('.').pop()
          const { data: photo, error: photoErr } = await supabase.storage
            .from('avatars')
            .upload(`${userId}/avatar.${ext}`, photoFile, { upsert: true })
          if (photoErr) throw photoErr
          photo_url = photo?.path || null
        }

        const { error: vetError } = await supabase
          .from('veterinaires')
          .insert({
            user_id: userId,
            wilaya: values.wilaya,
            adresse: values.adresse || '',
            bio: values.bio || '',
            photo_url,
            document_url,
            status: 'pending'
          })
        if (vetError) throw vetError

        // ✅ signOut بعد ما خلصنا كل شيء
        await supabase.auth.signOut()
        toast.success('Inscription réussie! En attente de vérification.')
        navigate('/auth/pending', { replace: true })
        return
      }

      // ✅ للـ maitre — signOut بعد insert
      await supabase.auth.signOut()
      toast.success('Inscription réussie!')
      navigate('/auth/login', { replace: true })

    } catch (error) {
      console.error('Register error:', error)
      toast.error(error.message || 'Erreur lors de l\'inscription')
    } finally {
      setLoadingSubmit(false)
    }
  }

  const onInvalid = (errs) => {
    const firstError = Object.values(errs)[0]
    if (firstError?.message) {
      toast.error(firstError.message)
    }
  }

  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Rejoignez Veto Care pour gérer la santé de votre animal"
    >
      {/* Progress */}
      <div className="flex gap-2 mb-6">
        {[1, role === 'veterinaire' ? 3 : 2].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              step >= s ? 'bg-primary' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Role Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-center text-sm text-gray-500 mb-4">Je suis...</p>
          <button
            type="button"
            onClick={() => handleRoleSelect('maitre')}
            className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-teal-50 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-teal-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <User className="h-7 w-7 text-primary group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Propriétaire</h3>
                <p className="text-sm text-gray-500">Prenez rendez-vous pour votre animal</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('veterinaire')}
            className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-teal-50 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-teal-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <Stethoscope className="h-7 w-7 text-primary group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Vétérinaire</h3>
                <p className="text-sm text-gray-500">Gérez vos rendez-vous et patients</p>
              </div>
            </div>
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Déjà un compte ? <Link to="/auth/login" className="text-primary hover:underline font-medium">Se connecter</Link>
          </p>
        </div>
      )}

      {/* Step 2: Common Fields */}
      {step === 2 && (
        <form onSubmit={handleSubmit(onCommonSubmit, onInvalid)} className="space-y-4">
          <div>
            <Label htmlFor="full_name">Nom complet</Label>
            <Input id="full_name" {...register('full_name')} placeholder="Mohamed Boudiaf" />
            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" {...register('phone')} placeholder="0555123456" />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <Label htmlFor="wilaya">Wilaya</Label>
            <select
              id="wilaya"
              {...register('wilaya')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Sélectionner une wilaya</option>
              {WILAYAS.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
            {errors.wilaya && <p className="text-red-500 text-xs mt-1">{errors.wilaya.message}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} placeholder="email@exemple.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" {...register('password')} placeholder="Minimum 8 caractères" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <input type="hidden" {...register('role')} value={currentRole || 'maitre'} />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
              Retour
            </Button>
            <Button type="submit" className="flex-1" disabled={loadingSubmit}>
              {loadingSubmit ? "Inscription..." : currentRole === 'veterinaire' ? 'Continuer' : "S'inscrire"}
            </Button>
          </div>
        </form>
      )}

      {/* Step 3: Vet-only Fields */}
      {step === 3 && role === 'veterinaire' && (
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
          <div>
            <Label htmlFor="adresse">Adresse du cabinet</Label>
            <Input id="adresse" {...register('adresse')} placeholder="123 Rue des Vet, Alger" />
          </div>

          <div>
            <Label htmlFor="bio">Biographie</Label>
            <Textarea id="bio" {...register('bio')} placeholder="Décrivez votre expérience et spécialités..." rows={3} />
          </div>

          <div>
            <Label>Photo de profil</Label>
            <div className="flex items-center gap-3 mt-1">
              <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                <Upload className="h-4 w-4" />
                <span className="text-sm">Choisir une photo</span>
                <input
                  type="file"
                  name="avatar_photo"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      setPhotoFile(file)
                      setPhotoPreview(URL.createObjectURL(file))
                    }
                  }}
                />
              </label>
              {photoPreview && (
                <img src={photoPreview} alt="Preview" className="h-10 w-10 rounded-full object-cover" />
              )}
            </div>
          </div>

          <div>
            <Label>Document de licence <span className="text-red-500">*</span></Label>
            <div className="flex items-center gap-2 mt-1">
              <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                <Upload className="h-4 w-4" />
                <span className="text-sm">Choisir un document</span>
                <input
                  type="file"
                  name="license_document"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  required
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) setDocumentFile(file)
                  }}
                />
              </label>
              {documentFile && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="h-3 w-3" /> {documentFile.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>
              Retour
            </Button>
            <Button type="submit" className="flex-1" disabled={loadingSubmit}>
              {loadingSubmit ? "Inscription..." : "S'inscrire"}
            </Button>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}
