import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PawPrint, Stethoscope, X, Shield, Info } from 'lucide-react'

const DEMO_ACCOUNTS = {
    veterinaire: {
        email: 'z_amamra@estin.dz',
        password: 'z_amamra@estin.dz',
    },
    maitre: {
        email: 'a_hamdi@estin.dz',
        password: 'a_hamdi@estin.dz',
    },
}

export default function DemoModal({ open, onClose }) {
    const navigate = useNavigate()
    const [hoveredRole, setHoveredRole] = useState(null)

    if (!open) return null

    const handleSelect = (role) => {
        const account = DEMO_ACCOUNTS[role]
        navigate(`/auth/login?demo=${role}&email=${encodeURIComponent(account.email)}&password=${encodeURIComponent(account.password)}`)
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-lg animate-in fade-in zoom-in duration-300">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">

                    {/* Header with gradient */}
                    <div className="relative bg-gradient-to-br from-[#0D3B23] via-[#14a38b] to-[#0D3B23] px-8 pt-8 pb-10 text-white">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-11 w-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
                                <Shield className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight">Mode Démonstration</h2>
                                <p className="text-white/70 text-xs font-medium">Simulation d'authentification</p>
                            </div>
                        </div>

                        <p className="text-sm leading-relaxed text-white/85">
                            Cette démonstration a été réalisée à la demande de notre enseignant dans le cadre d'une présentation académique.
                            Vous pouvez tester l'application avec les comptes ci-dessous, ou utiliser le système d'inscription classique qui reste pleinement fonctionnel.
                        </p>
                    </div>

                    {/* Info badge */}
                    <div className="px-8 -mt-5">
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-3">
                            <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                Choisissez un rôle ci-dessous. Les identifiants seront saisis automatiquement sur la page de connexion.
                            </p>
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="px-8 py-6 space-y-3">
                        {/* Maître button */}
                        <button
                            onClick={() => handleSelect('maitre')}
                            onMouseEnter={() => setHoveredRole('maitre')}
                            onMouseLeave={() => setHoveredRole(null)}
                            className={`w-full group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 text-left p-5
                ${hoveredRole === 'maitre'
                                    ? 'border-[#14a38b] bg-[#14a38b]/5 shadow-lg shadow-[#14a38b]/10'
                                    : 'border-gray-200 bg-white hover:border-gray-300'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300
                  ${hoveredRole === 'maitre' ? 'bg-[#14a38b] text-white scale-110' : 'bg-gray-100 text-gray-500'}`}>
                                    <PawPrint className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 text-base">Se connecter comme Maître</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Propriétaire d'animaux — <span className="font-mono text-gray-600">a_hamdi@estin.dz</span></p>
                                </div>
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300
                  ${hoveredRole === 'maitre' ? 'bg-[#14a38b] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                </div>
                            </div>
                        </button>

                        {/* Vétérinaire button */}
                        <button
                            onClick={() => handleSelect('veterinaire')}
                            onMouseEnter={() => setHoveredRole('veterinaire')}
                            onMouseLeave={() => setHoveredRole(null)}
                            className={`w-full group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 text-left p-5
                ${hoveredRole === 'veterinaire'
                                    ? 'border-[#14a38b] bg-[#14a38b]/5 shadow-lg shadow-[#14a38b]/10'
                                    : 'border-gray-200 bg-white hover:border-gray-300'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300
                  ${hoveredRole === 'veterinaire' ? 'bg-[#14a38b] text-white scale-110' : 'bg-gray-100 text-gray-500'}`}>
                                    <Stethoscope className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 text-base">Se connecter comme Vétérinaire</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Professionnel vétérinaire — <span className="font-mono text-gray-600">z_amamra@estin.dz</span></p>
                                </div>
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300
                  ${hoveredRole === 'veterinaire' ? 'bg-[#14a38b] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="px-8 pb-6">
                        <button
                            onClick={onClose}
                            className="w-full py-3 text-sm text-gray-500 font-semibold hover:text-gray-700 transition-colors rounded-xl hover:bg-gray-50"
                        >
                            Continuer sans compte démo →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
