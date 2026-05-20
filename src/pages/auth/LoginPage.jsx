import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/context/useAuth'
import AuthLayout from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, profile, loading } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [demoTyping, setDemoTyping] = useState(false)
  const [demoBanner, setDemoBanner] = useState(null)
  const submitBtnRef = useRef(null)

  useEffect(() => {
    if (user && profile && !loading) {
      navigate(profile.role === 'veterinaire' ? '/dashboard/vet' : '/dashboard/owner', { replace: true })
    }
  }, [user, profile, loading, navigate])

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  })

  // Demo auto-typing simulation
  useEffect(() => {
    const demoRole = searchParams.get('demo')
    const demoEmail = searchParams.get('email')
    const demoPassword = searchParams.get('password')

    if (demoRole && demoEmail && demoPassword) {
      setDemoBanner(demoRole === 'veterinaire' ? 'Vétérinaire' : 'Maître')
      setDemoTyping(true)

      const emailInput = document.getElementById('email')
      const passwordInput = document.getElementById('password')

      let currentEmail = ''
      let currentPassword = ''
      let emailIndex = 0
      let passwordIndex = 0

      // Clear any existing values
      if (emailInput) emailInput.value = ''
      if (passwordInput) passwordInput.value = ''
      setValue('email', '')
      setValue('password', '')

      // Type email character by character
      const typeEmail = () => {
        if (emailIndex < demoEmail.length) {
          currentEmail += demoEmail[emailIndex]
          if (emailInput) {
            emailInput.value = currentEmail
            emailInput.style.caretColor = 'transparent'
          }
          setValue('email', currentEmail)
          emailIndex++
          setTimeout(typeEmail, 45 + Math.random() * 35)
        } else {
          // Finished email, start password after a small pause
          setTimeout(typePassword, 400)
        }
      }

      // Type password character by character
      const typePassword = () => {
        if (passwordIndex < demoPassword.length) {
          currentPassword += demoPassword[passwordIndex]
          if (passwordInput) {
            passwordInput.value = currentPassword
            passwordInput.style.caretColor = 'transparent'
          }
          setValue('password', currentPassword)
          passwordIndex++
          setTimeout(typePassword, 45 + Math.random() * 35)
        } else {
          // Finished typing, click submit after a pause
          setDemoTyping(false)
          setTimeout(() => {
            if (submitBtnRef.current) {
              submitBtnRef.current.click()
            }
          }, 600)
        }
      }

      // Start typing after a brief moment
      const startTimeout = setTimeout(() => {
        if (emailInput) emailInput.focus()
        typeEmail()
      }, 800)

      return () => clearTimeout(startTimeout)
    }
  }, [searchParams, setValue])

  const handleLogin = async (values) => {
    setSubmitting(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        toast.error('Email ou mot de passe incorrect')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()

      let profileData = null
      for (let attempt = 0; attempt < 5; attempt++) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        if (data) {
          profileData = data
          break
        }
        await new Promise(r => setTimeout(r, 500))
      }

      if (!profileData) {
        toast.error('Erreur: profil introuvable')
        return
      }

      if (profileData.role === 'veterinaire') {
        let vetData = null
        for (let attempt = 0; attempt < 5; attempt++) {
          const { data } = await supabase
            .from('veterinaires')
            .select('status')
            .eq('user_id', user.id)
            .single()
          if (data) {
            vetData = data
            break
          }
          await new Promise(r => setTimeout(r, 500))
        }

        if (!vetData) {
          toast.error('Erreur: profil vétérinaire introuvable')
          return
        }

        if (vetData.status === 'pending') {
          navigate('/auth/pending')
        } else if (vetData.status === 'rejected') {
          toast.error('Votre compte a été refusé. Contactez le support.')
          await supabase.auth.signOut()
        } else {
          navigate('/dashboard/vet')
        }
        return
      }

      navigate('/dashboard/owner')
    } catch {
      toast.error("Erreur lors de la connexion")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Bonjour!"
      subtitle="Pour vous connecter à votre compte, renseignez votre adresse email ainsi que votre mot de passe."
    >
      {/* Demo Banner */}
      {demoBanner && (
        <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0D3B23] to-[#14a38b] p-4 text-white shadow-lg">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-50"></div>
          <div className="relative flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/70">Mode Démonstration</p>
              <p className="text-sm font-semibold">
                Connexion automatique — {demoBanner}
              </p>
            </div>
          </div>
          {demoTyping && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span className="text-xs text-white/60 font-medium">Saisie en cours...</span>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
        <div>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="Votre adresse email"
            className={`h-14 rounded-2xl bg-gray-50 border-none px-6 focus-visible:ring-[#14a38b]/20 transition-all duration-200 ${demoTyping ? 'ring-2 ring-[#14a38b]/30 bg-[#14a38b]/5' : ''}`}
            readOnly={demoTyping}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1 px-2">{errors.email.message}</p>}
        </div>

        <div>
          <Input
            id="password"
            type="password"
            {...register('password')}
            placeholder="Votre mot de passe"
            className={`h-14 rounded-2xl bg-gray-50 border-none px-6 focus-visible:ring-[#14a38b]/20 transition-all duration-200 ${demoTyping ? 'ring-2 ring-[#14a38b]/30 bg-[#14a38b]/5' : ''}`}
            readOnly={demoTyping}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1 px-2">{errors.password.message}</p>}
        </div>

        <div className="flex justify-start">
          <Link to="/auth/forgot-password" size="sm" className="text-xs text-[#14a38b] font-bold hover:underline">
            Mot de passe oublié?
          </Link>
        </div>

        <Button
          ref={submitBtnRef}
          type="submit"
          className={`w-full h-14 rounded-2xl bg-black hover:bg-gray-800 text-white font-black text-sm uppercase tracking-widest transition-all ${demoTyping ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={submitting || demoTyping}
        >
          {submitting ? 'Connexion...' : 'SE CONNECTER'}
        </Button>

        <p className="text-center text-sm text-gray-400 font-medium mt-6">
          Pas encore de compte ? <Link to="/auth/register" className="text-[#14a38b] font-bold hover:underline">S&apos;inscrire</Link>
        </p>
      </form>
    </AuthLayout>
  )
}
