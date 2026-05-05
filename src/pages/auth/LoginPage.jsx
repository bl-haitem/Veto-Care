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
import { toast } from 'sonner'
import { ArrowUpRight } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const { user, profile, loading } = useAuth()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user && profile && !loading) {
      navigate(profile.role === 'veterinaire' ? '/dashboard/vet' : '/dashboard/owner', { replace: true })
    }
  }, [user, profile, loading, navigate])

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  })

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
      <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
        <div>
          <Input 
            id="email" 
            type="email" 
            {...register('email')} 
            placeholder="Votre adresse email" 
            className="h-14 rounded-2xl bg-gray-50 border-none px-6 focus-visible:ring-[#14a38b]/20"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1 px-2">{errors.email.message}</p>}
        </div>

        <div>
          <Input 
            id="password" 
            type="password" 
            {...register('password')} 
            placeholder="Votre mot de passe" 
            className="h-14 rounded-2xl bg-gray-50 border-none px-6 focus-visible:ring-[#14a38b]/20"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1 px-2">{errors.password.message}</p>}
        </div>

        <div className="flex justify-start">
          <Link to="/auth/forgot-password" size="sm" className="text-xs text-[#14a38b] font-bold hover:underline">
            Mot de passe oublié?
          </Link>
        </div>

        <Button 
          type="submit" 
          className="w-full h-14 rounded-2xl bg-black hover:bg-gray-800 text-white font-black text-sm uppercase tracking-widest transition-all" 
          disabled={submitting}
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
