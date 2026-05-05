import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PawPrint, Calendar, Stethoscope, Bell, MessageSquare, Clock, ArrowUpRight, Menu, X } from 'lucide-react'

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen font-sans bg-gray-50 text-gray-900">
      {/* HERO SECTION */}
      <div className="relative min-h-screen flex flex-col">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0 bg-black">
          <img 
            src="/cat_peeking.png" 
            alt="Cat Background" 
            className="w-full h-full object-cover object-center opacity-40" 
          />
        </div>

        {/* Navigation Bar */}
        <header className="relative z-30 w-full px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <PawPrint className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl tracking-tight">Veto Care</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold">
            <a href="#about" className="hover:text-primary transition-colors">Qu'est-ce que Veto Care</a>
            <a href="#features" className="hover:text-primary transition-colors">Fonctionnalités</a>
            <a href="#register-guide" className="hover:text-primary transition-colors">Guide d'inscription</a>
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <Link to="/auth/login">
              <span className="text-sm font-semibold hover:text-gray-300 transition-colors px-4">Connexion</span>
            </Link>
            <Link to="/auth/register">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 text-sm font-semibold">S'inscrire</Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 bg-gray-900/95 backdrop-blur-sm lg:hidden flex flex-col p-8 pt-24 text-white">
            <nav className="flex flex-col gap-6 text-xl font-bold mb-8">
              <a href="#about" onClick={() => setIsMenuOpen(false)}>Qu'est-ce que Veto Care</a>
              <a href="#features" onClick={() => setIsMenuOpen(false)}>Fonctionnalités</a>
              <a href="#register-guide" onClick={() => setIsMenuOpen(false)}>Guide d'inscription</a>
            </nav>
            
            <div className="h-px bg-white/10 mb-8" />
            
            <div className="mt-auto flex flex-col gap-4">
              <Link to="/auth/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full h-12 text-white border-white/20 bg-transparent hover:bg-white/10">Connexion</Button>
              </Link>
              <Link to="/auth/register" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full h-12 bg-primary text-white">S'inscrire</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Hero Content */}
        <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 flex flex-col justify-center py-20 lg:py-0">
          <div className="text-left">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
              La santé de votre animal,<br/>
              <span className="text-primary block mt-2">notre priorité</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-200 mt-6 max-w-2xl leading-relaxed font-medium">
              Trouvez un vétérinaire qualifié, prenez rendez-vous en ligne et suivez la santé de votre animal en toute simplicité.
            </p>
            <div className="flex flex-wrap gap-4 mt-10">
              <Link to="/auth/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white rounded-md px-8 h-12 text-base font-semibold shadow-xl">
                  Commencer <ArrowUpRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#about" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-md px-8 h-12 text-base font-semibold text-white border-white/30 bg-transparent hover:bg-white/10 transition-all">
                  En savoir plus <ArrowUpRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>
          </div>
        </main>
      </div>

      {/* WHAT IS VETO CARE */}
      <section id="about" className="py-20 lg:py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
            
            {/* Content Column */}
            <div className="flex-1 text-left">
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-bold mb-6">
                C'est quoi Veto Care
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6 leading-tight text-[#0D3B23]">
                Qu'est-ce que<br/>Veto Care ?
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-gray-500 max-w-xl">
                Veto Care est une plateforme complète conçue pour rapprocher les propriétaires d'animaux et les vétérinaires professionnels. Nous offrons une expérience numérique fluide pour gérer les dossiers médicaux de vos animaux, planifier des rendez-vous, et trouver les meilleurs soins possibles pour vos compagnons à quatre pattes.
              </p>
            </div>

            {/* Image Column */}
            <div className="flex-1 relative w-full max-w-md lg:max-w-none mt-12 lg:mt-0">
              <div className="absolute inset-0 bg-primary/10 rounded-[1.5rem] sm:rounded-[2rem] transform -rotate-3 lg:-rotate-6 translate-x-3 lg:translate-x-4 -translate-y-3 lg:-translate-y-4"></div>
              <img 
                src="https://img.freepik.com/photos-gratuite/veterinaire-prenant-soin-chien-compagnie_23-2149198684.jpg" 
                alt="Veto Care Overview" 
                className="relative z-10 w-full h-[300px] sm:h-[400px] object-cover rounded-[1.5rem] sm:rounded-[2rem] shadow-xl border border-gray-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 lg:py-32 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Fonctionnalités</h2>
            <p className="mt-4 text-base sm:text-lg text-gray-500">Tout ce dont vous avez besoin pour soigner vos animaux.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { id: 1, icon: Calendar, title: "Rendez-vous en ligne", desc: "Réservez facilement un créneau chez votre vétérinaire, 24h/24." },
              { id: 2, icon: Stethoscope, title: "Vétérinaires vérifiés", desc: "Tous nos vétérinaires sont vérifiés et certifiés pour votre confiance." },
              { id: 3, icon: Bell, title: "Notifications en temps réel", desc: "Recevez des confirmations et rappels automatiques pour vos rendez-vous." },
              { id: 4, icon: MessageSquare, title: "Assistant IA (VetoBot)", desc: "Notre chatbot intelligent répond à vos questions vétérinaires et vous guide sur la plateforme." },
              { id: 5, icon: Clock, title: "Gestion simplifiée", desc: "Suivez l'historique des consultations et gérez vos rendez-vous facilement." },
              { id: 6, icon: PawPrint, title: "Pour tous les animaux", desc: "Que vous ayez un chien, chat ou autre animal, nous sommes là pour vous." },
            ].map((f) => (
              <Card key={f.id} className="p-6 sm:p-8 border border-gray-100 bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl transition-all">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center mb-6 bg-primary/5">
                  <f.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                </div>
                <h3 className="font-bold text-lg sm:text-xl mb-3 text-gray-900">{f.title}</h3>
                <p className="text-sm sm:text-base text-gray-500 leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* HOW TO REGISTER */}
      <section id="register-guide" className="py-20 lg:py-32 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Comment s'inscrire</h2>
            <p className="mt-4 text-base sm:text-lg text-gray-500">Rejoignez notre plateforme, que vous soyez propriétaire d'un animal ou une clinique vétérinaire.</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {[
              { 
                id: 'owner', 
                icon: PawPrint, 
                title: "En tant que Propriétaire", 
                steps: [
                  "Cliquez sur le bouton \"S'inscrire\" et sélectionnez \"Propriétaire\".",
                  "Remplissez vos informations personnelles pour créer un compte.",
                  "Ajoutez vos animaux à votre profil et commencez à prendre rendez-vous."
                ] 
              },
              { 
                id: 'vet', 
                icon: Stethoscope, 
                title: "En tant que Vétérinaire", 
                steps: [
                  "Cliquez sur \"S'inscrire\" et choisissez l'option \"Vétérinaire\".",
                  "Fournissez vos justificatifs professionnels et les informations de votre clinique.",
                  "Configurez vos disponibilités et commencez à recevoir des rendez-vous."
                ] 
              },
            ].map((r) => (
              <div key={r.id} className="p-8 sm:p-10 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 bg-white">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <r.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">{r.title}</h3>
                <ul className="space-y-4">
                  {r.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-gray-600">
                      <div className="mt-2 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 bg-gray-900 text-gray-400 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm sm:text-base">© 2026 Veto Care — Tous droits réservés</p>
        </div>
      </footer>
    </div>
  )
}
