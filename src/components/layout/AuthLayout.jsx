import { Link } from 'react-router-dom'
import { PawPrint } from 'lucide-react'

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-50 via-white to-gray-50">
      <header className="p-4">
        <Link to="/" className="flex items-center gap-2 text-primary">
          <PawPrint className="h-6 w-6" />
          <span className="font-bold text-lg font-heading">Veto Care</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {title && (
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold font-heading text-gray-900">{title}</h1>
              {subtitle && <p className="text-gray-500 mt-2 text-sm">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </div>

      <footer className="p-4 text-center text-xs text-muted-foreground">
        © 2026 Veto Care — Tous droits réservés
      </footer>
    </div>
  )
}
