import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/context/useAuth'
import AuthLayout from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { WILAYAS } from '@/lib/constants'
import { User, Stethoscope, Upload, Check, ArrowUpRight } from 'lucide-react'
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
  const [documentFile, setDocumentFile] = useState(null)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'maitre' },
  })

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
          email: values.email,
          role: values.role,
        })
      if (profileError) throw profileError

      // 2. إذا بيطري — ارفع الملفات وأنشئ السجل
      if (values.role === 'veterinaire') {
        let document_url = null
        if (documentFile) {
          const ext = documentFile.name.split('.').pop()
          const { data: doc, error: docErr } = await supabase.storage
            .from('carnets')
            .upload(`${userId}/license.${ext}`, documentFile, { upsert: true })
          if (docErr) throw docErr
          document_url = doc?.path || null
        }

        const { error: vetError } = await supabase
          .from('veterinaires')
          .insert({
            user_id: userId,
            wilaya: values.wilaya,
            adresse: values.adresse || '',
            bio: values.bio || '',
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
      title={step === 1 ? "Créer un compte" : step === 2 ? "Informations de base" : "Détails professionnels"}
      subtitle={step === 1 ? "Choisissez votre rôle pour commencer" : "Veuillez remplir les champs ci-dessous"}
    >
      {/* Progress */}
      <div className="flex gap-2 mb-4">
        {[1, role === 'veterinaire' ? 3 : 2].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
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
        <form onSubmit={handleSubmit(onCommonSubmit, onInvalid)} className="space-y-3">
          <div>
            <Label htmlFor="full_name" className="text-xs mb-1">Nom complet</Label>
            <Input id="full_name" {...register('full_name')} placeholder="Mohamed Boudiaf" className="h-12 rounded-xl bg-gray-50 border-none px-4 focus-visible:ring-[#14a38b]/20" />
            {errors.full_name && <p className="text-red-500 text-[10px] mt-0.5">{errors.full_name.message}</p>}
          </div>

          <div>
            <Label htmlFor="phone" className="text-xs mb-1">Téléphone</Label>
            <Input id="phone" {...register('phone')} placeholder="0555123456" className="h-12 rounded-xl bg-gray-50 border-none px-4 focus-visible:ring-[#14a38b]/20" />
            {errors.phone && <p className="text-red-500 text-[10px] mt-0.5">{errors.phone.message}</p>}
          </div>

          <div>
            <Label htmlFor="wilaya" className="text-xs mb-1">Wilaya</Label>
            <select
              id="wilaya"
              {...register('wilaya')}
              className="flex h-12 w-full rounded-xl bg-gray-50 border-none px-4 text-sm focus-visible:ring-[#14a38b]/20 outline-none appearance-none cursor-pointer"
            >
              <option value="">Sélectionner une wilaya</option>
              {WILAYAS.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
            {errors.wilaya && <p className="text-red-500 text-[10px] mt-0.5">{errors.wilaya.message}</p>}
          </div>

          <div>
            <Label htmlFor="email" className="text-xs mb-1">Email</Label>
            <Input id="email" type="email" {...register('email')} placeholder="email@exemple.com" className="h-12 rounded-xl bg-gray-50 border-none px-4 focus-visible:ring-[#14a38b]/20" />
            {errors.email && <p className="text-red-500 text-[10px] mt-0.5">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="password" className="text-xs mb-1">Mot de passe</Label>
            <Input id="password" type="password" {...register('password')} placeholder="Minimum 8 caractères" className="h-12 rounded-xl bg-gray-50 border-none px-4 focus-visible:ring-[#14a38b]/20" />
            {errors.password && <p className="text-red-500 text-[10px] mt-0.5">{errors.password.message}</p>}
          </div>

          <input type="hidden" {...register('role')} value={currentRole || 'maitre'} />

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setStep(1)}>
              Retour
            </Button>
            <Button type="submit" className="flex-1 h-12 rounded-xl bg-black hover:bg-gray-800 text-white font-black text-xs uppercase tracking-widest" disabled={loadingSubmit}>
              {loadingSubmit ? "Inscription..." : currentRole === 'veterinaire' ? 'Continuer' : "S'inscrire"}
            </Button>
          </div>
        </form>
      )}

      {/* Step 3: Vet-only Fields */}
      {step === 3 && role === 'veterinaire' && (
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-3">
          <div>
            <Label htmlFor="adresse" className="text-xs mb-1">Adresse du cabinet</Label>
            <Input id="adresse" {...register('adresse')} placeholder="123 Rue des Vet, Alger" className="h-12 rounded-xl bg-gray-50 border-none px-4 focus-visible:ring-[#14a38b]/20" />
          </div>

          <div>
            <Label htmlFor="bio" className="text-xs mb-1">Biographie</Label>
            <Textarea id="bio" {...register('bio')} placeholder="Décrivez votre expérience et spécialités..." rows={3} className="rounded-xl bg-gray-50 border-none px-4 py-3 focus-visible:ring-[#14a38b]/20 text-sm" />
          </div>

          <div>
            <Label className="text-xs mb-1">Document de licence <span className="text-red-500">*</span></Label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 px-4 py-2 border rounded-xl cursor-pointer hover:bg-accent transition-colors text-sm">
                <Upload className="h-4 w-4 text-[#14a38b]" />
                <span>Choisir un document</span>
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
                <span className="text-[10px] text-green-600 flex items-center gap-1 font-medium truncate max-w-[150px]">
                  <Check className="h-3 w-3" /> {documentFile.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setStep(2)}>
              Retour
            </Button>
            <Button type="submit" className="flex-1 h-12 rounded-xl bg-black hover:bg-gray-800 text-white font-black text-xs uppercase tracking-widest" disabled={loadingSubmit}>
              {loadingSubmit ? "Inscription..." : "S'INSCRIRE"}
            </Button>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}
