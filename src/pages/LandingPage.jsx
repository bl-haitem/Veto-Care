import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PawPrint, Calendar, Stethoscope, Bell, Shield, Clock } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-gray-50">
      <header className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <PawPrint className="h-7 w-7" />
            <span className="font-bold text-xl font-heading">Veto Care</span>
          </div>
          <div className="flex gap-3">
            <Link to="/auth/login">
              <Button variant="ghost">Se connecter</Button>
            </Link>
            <Link to="/auth/register">
              <Button>S&apos;inscrire</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-gray-900 leading-tight">
            La santé de votre animal,{' '}
            <span className="text-primary">notre priorité</span>
          </h1>
          <p className="text-lg text-gray-600 mt-6 max-w-2xl mx-auto">
            Trouvez un vétérinaire qualifié, prenez rendez-vous en ligne et suivez la santé de votre animal en toute simplicité.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link to="/auth/register">
              <Button size="lg" className="px-8 text-lg">Commencer maintenant</Button>
            </Link>
            <Link to="/auth/login">
              <Button size="lg" variant="outline" className="px-8 text-lg">Se connecter</Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
          <Card className="p-6 border-gray-200">
            <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg font-heading">Rendez-vous en ligne</h3>
            <p className="text-gray-500 mt-2 text-sm">R&eacute;servez facilement un cr&eacute;neau chez votre v&eacute;t&eacute;rinaire, 24h/24.</p>
          </Card>

          <Card className="p-6 border-gray-200">
            <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center mb-4">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg font-heading">Vétérinaires vérifiés</h3>
            <p className="text-gray-500 mt-2 text-sm">Tous nos vétérinaires sont vérifiés et certifiés pour votre confiance.</p>
          </Card>

          <Card className="p-6 border-gray-200">
            <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center mb-4">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg font-heading">Notifications en temps réel</h3>
            <p className="text-gray-500 mt-2 text-sm">Recevez des confirmations et rappels automatiques pour vos rendez-vous.</p>
          </Card>

          <Card className="p-6 border-gray-200">
            <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg font-heading">Carnet médical sécurisé</h3>
            <p className="text-gray-500 mt-2 text-sm">Vos documents médicaux sont stockés en toute sécurité et accessibles à tout moment.</p>
          </Card>

          <Card className="p-6 border-gray-200">
            <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg font-heading">Gestion simplifiée</h3>
            <p className="text-gray-500 mt-2 text-sm">Suivez l&apos;historique des consultations et g&eacute;rez vos rendez-vous facilement.</p>
          </Card>

          <Card className="p-6 border-gray-200">
            <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center mb-4">
              <PawPrint className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg font-heading">Pour tous les animaux</h3>
            <p className="text-gray-500 mt-2 text-sm">Que vous ayez un chien, chat ou autre animal, nous sommes l&agrave; pour vous.</p>
          </Card>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-400">
          © 2026 Veto Care — Tous droits réservés
        </div>
      </footer>
    </div>
  )
}
