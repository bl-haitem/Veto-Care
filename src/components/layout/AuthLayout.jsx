import { Link } from 'react-router-dom'
import { PawPrint, ArrowRight, Globe, Undo2 } from 'lucide-react'

export default function AuthLayout({ children, title, subtitle, hideImage = false }) {
  return (
    <div className="h-screen w-screen bg-[#e8f5f1] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
      <div className="bg-white w-full max-w-[1200px] h-full max-h-[850px] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Top Left Return Button */}
        <Link 
          to="/" 
          className="absolute top-8 left-8 z-20 h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-900 hover:bg-gray-100 transition-colors shadow-sm ring-1 ring-black/5"
          title="Retour à l'accueil"
        >
          <Undo2 className="h-6 w-6" />
        </Link>

        {/* Left Side: Form */}
        <div className="flex-1 p-8 sm:p-12 flex flex-col justify-between overflow-hidden">

          {/* Form Content */}
          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-black font-heading text-gray-900 tracking-tight mb-3">
                {title || 'Bonjour!'}
              </h1>
              <p className="text-gray-500 font-medium">
                {subtitle || 'Pour vous connecter à votre compte, renseignez votre adresse email ainsi que votre mot de passe.'}
              </p>
            </div>

            <div className="space-y-6">
              {children}
            </div>
          </div>

        </div>

        {/* Right Side: Hero Image */}
        {!hideImage && (
          <div className="hidden md:block flex-1 relative overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?q=80&w=2070&auto=format&fit=crop" 
              alt="Veterinary Care"
              className="absolute inset-0 w-full h-full object-cover scale-[1.05] origin-top-left"
            />
          </div>
        )}
      </div>
    </div>
  )
}
