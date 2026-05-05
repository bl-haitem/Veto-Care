import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PawPrint, Calendar, Stethoscope, Bell, MessageSquare, Clock, Globe, ChevronDown, ArrowUpRight, Menu, X } from 'lucide-react'

const translations = {
  EN: {
    navAbout: "What is Veto Care",
    navFeatures: "Features",
    navRegister: "Register Guide",
    login: "Log In",
    signup: "Sign Up",
    heroTitle1: "Your pet's health,",
    heroTitle2: "our priority",
    heroSub: "Find a qualified veterinarian, book an appointment online and follow your pet's health with ease.",
    getStarted: "Get Started",
    learnMore: "Learn More",
    aboutBadge: "What is Veto Care",
    aboutTitle: "What is\nVeto Care ?",
    aboutDesc: "Veto Care is a comprehensive platform designed to bring pet owners and professional veterinarians closer together. We offer a smooth digital experience to manage your pets' medical records, schedule appointments, and find the best possible care for your four-legged companions.",
    featTitle: "Features",
    featSub: "Everything you need to care for your animals.",
    feat1Title: "Online Appointments",
    feat1Desc: "Easily book a slot with your veterinarian, 24/7.",
    feat2Title: "Verified Veterinarians",
    feat2Desc: "All our veterinarians are verified and certified for your trust.",
    feat3Title: "Real-time Notifications",
    feat3Desc: "Receive automatic confirmations and reminders for your appointments.",
    feat4Title: "Secure Medical Record",
    feat4Desc: "Your medical documents are stored securely and accessible at any time.",
    feat5Title: "Simplified Management",
    feat5Desc: "Track consultation history and manage your appointments easily.",
    feat6Title: "For all animals",
    feat6Desc: "Whether you have a dog, cat or other animal, we are here for you.",
    regTitle: "How to Register",
    regSub: "Join our platform whether you are a pet owner or a veterinary clinic.",
    regOwner: "As a Propriétaire",
    regVet: "As a Vétérinaire",
    regOwnerStep1: "Click on the \"Sign Up\" button and select \"Propriétaire\".",
    regOwnerStep2: "Fill in your personal details to create an account.",
    regOwnerStep3: "Add your pets to your profile and start booking appointments.",
    regVetStep1: "Click on \"Sign Up\" and choose the \"Vétérinaire\" option.",
    regVetStep2: "Provide your professional credentials and clinic information.",
    regVetStep3: "Set up your availability and start receiving appointments.",
    footer: "© 2026 Veto Care — All rights reserved"
  },
  FR: {
    navAbout: "Qu'est-ce que Veto Care",
    navFeatures: "Fonctionnalités",
    navRegister: "Guide d'inscription",
    login: "Connexion",
    signup: "S'inscrire",
    heroTitle1: "La santé de votre animal,",
    heroTitle2: "notre priorité",
    heroSub: "Trouvez un vétérinaire qualifié, prenez rendez-vous en ligne et suivez la santé de votre animal en toute simplicité.",
    getStarted: "Commencer",
    learnMore: "En savoir plus",
    aboutBadge: "C'est quoi Veto Care",
    aboutTitle: "Qu'est-ce que\nVeto Care ?",
    aboutDesc: "Veto Care est une plateforme complète conçue pour rapprocher les propriétaires d'animaux et les vétérinaires professionnels. Nous offrons une expérience numérique fluide pour gérer les dossiers médicaux de vos animaux, planifier des rendez-vous, et trouver les meilleurs soins possibles pour vos compagnons à quatre pattes.",
    featTitle: "Fonctionnalités",
    featSub: "Tout ce dont vous avez besoin pour soigner vos animaux.",
    feat1Title: "Rendez-vous en ligne",
    feat1Desc: "Réservez facilement un créneau chez votre vétérinaire, 24h/24.",
    feat2Title: "Vétérinaires vérifiés",
    feat2Desc: "Tous nos vétérinaires sont vérifiés et certifiés pour votre confiance.",
    feat3Title: "Notifications en temps réel",
    feat3Desc: "Recevez des confirmations et rappels automatiques pour vos rendez-vous.",
    feat4Title: "Assistant IA (VetoBot)",
    feat4Desc: "Notre chatbot intelligent répond à vos questions vétérinaires et vous guide sur la plateforme.",
    feat5Title: "Gestion simplifiée",
    feat5Desc: "Suivez l'historique des consultations et gérez vos rendez-vous facilement.",
    feat6Title: "Pour tous les animaux",
    feat6Desc: "Que vous ayez un chien, chat ou autre animal, nous sommes là pour vous.",
    regTitle: "Comment s'inscrire",
    regSub: "Rejoignez notre plateforme, que vous soyez propriétaire d'un animal ou une clinique vétérinaire.",
    regOwner: "En tant que Propriétaire",
    regVet: "En tant que Vétérinaire",
    regOwnerStep1: "Cliquez sur le bouton \"S'inscrire\" et sélectionnez \"Propriétaire\".",
    regOwnerStep2: "Remplissez vos informations personnelles pour créer un compte.",
    regOwnerStep3: "Ajoutez vos animaux à votre profil et commencez à prendre rendez-vous.",
    regVetStep1: "Cliquez sur \"S'inscrire\" et choisissez l'option \"Vétérinaire\".",
    regVetStep2: "Fournissez vos justificatifs professionnels et les informations de votre clinique.",
    regVetStep3: "Configurez vos disponibilités et commencez à recevoir des rendez-vous.",
    footer: "© 2026 Veto Care — Tous droits réservés"
  },
  AR: {
    navAbout: "ما هو فيتو كير",
    navFeatures: "المميزات",
    navRegister: "دليل التسجيل",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب",
    heroTitle1: "صحة حيوانك الأليف،",
    heroTitle2: "أولويتنا",
    heroSub: "ابحث عن طبيب بيطري مؤهل، احجز موعداً عبر الإنترنت وتابع صحة حيوانك الأليف بكل سهولة.",
    getStarted: "ابدأ الآن",
    learnMore: "اقرأ المزيد",
    aboutBadge: "ما هو فيتو كير",
    aboutTitle: "ما هو\nفيتو كير؟",
    aboutDesc: "فيتو كير هي منصة شاملة مصممة لتقريب أصحاب الحيوانات الأليفة من الأطباء البيطريين المحترفين. نحن نقدم تجربة رقمية سلسة لإدارة السجلات الطبية لحيواناتك الأليفة، وجدولة المواعيد، والعثور على أفضل رعاية ممكنة لرفاقك ذوي الأرجل الأربعة.",
    featTitle: "المميزات",
    featSub: "كل ما تحتاجه لرعاية حيواناتك.",
    feat1Title: "مواعيد عبر الإنترنت",
    feat1Desc: "احجز موعداً بسهولة مع طبيبك البيطري، على مدار الساعة.",
    feat2Title: "أطباء معتمدون",
    feat2Desc: "جميع أطبائنا البيطريين معتمدون وموثوقون لضمان راحتك.",
    feat3Title: "إشعارات فورية",
    feat3Desc: "تلقى تأكيدات وتذكيرات تلقائية لمواعيدك.",
    feat4Title: "سجل طبي آمن",
    feat4Desc: "يتم تخزين مستنداتك الطبية بشكل آمن ويمكن الوصول إليها في أي وقت.",
    feat5Title: "إدارة مبسطة",
    feat5Desc: "تتبع تاريخ الاستشارات وإدارة مواعيدك بسهولة.",
    feat6Title: "لكل الحيوانات",
    feat6Desc: "سواء كان لديك كلب، قطة أو أي حيوان آخر، نحن هنا من أجلك.",
    regTitle: "كيفية التسجيل",
    regSub: "انضم إلى منصتنا سواء كنت صاحب حيوان أليف أو عيادة بيطرية.",
    regOwner: "كصاحب حيوان أليف",
    regVet: "كطبيب بيطري",
    regOwnerStep1: "انقر على زر \"إنشاء حساب\" واختر \"صاحب حيوان أليف\".",
    regOwnerStep2: "املأ بياناتك الشخصية لإنشاء حساب.",
    regOwnerStep3: "أضف حيواناتك الأليفة إلى ملفك الشخصي وابدأ بحجز المواعيد.",
    regVetStep1: "انقر على \"إنشاء حساب\" واختر خيار \"طبيب بيطري\".",
    regVetStep2: "قدم أوراقك المهنية ومعلومات عيادتك.",
    regVetStep3: "حدد أوقات توفرك وابدأ في استقبال المواعيد.",
    footer: "© 2026 فيتو كير — جميع الحقوق محفوظة"
  }
}

export default function LandingPage() {
  const [lang, setLang] = useState('FR')
  const [isLangOpen, setIsLangOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const t = translations[lang]

  return (
    <div className="min-h-screen font-sans bg-gray-50 text-gray-900" dir={lang === 'AR' ? 'rtl' : 'ltr'}>
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
            <a href="#about" className="hover:text-primary transition-colors">{t.navAbout}</a>
            <a href="#features" className="hover:text-primary transition-colors">{t.navFeatures}</a>
            <a href="#register-guide" className="hover:text-primary transition-colors">{t.navRegister}</a>
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            {/* Language Selector */}
            <div className="relative">
              <div 
                className="flex items-center gap-1 cursor-pointer hover:text-gray-300 px-2 py-1 rounded-md transition-colors"
                onClick={() => setIsLangOpen(!isLangOpen)}
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-semibold">{lang === 'EN' ? 'English' : lang === 'FR' ? 'Français' : 'العربية'}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {isLangOpen && (
                <div className={`absolute top-full ${lang === 'AR' ? 'left-0' : 'right-0'} mt-2 w-32 bg-white text-gray-900 rounded-lg shadow-xl py-2 z-50 border border-gray-100`}>
                  {['EN', 'FR', 'AR'].map((l) => (
                    <div 
                      key={l}
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${lang === l ? 'font-bold text-primary' : ''}`}
                      onClick={() => {
                        setLang(l)
                        setIsLangOpen(false)
                      }}
                    >
                      {l === 'EN' ? 'English' : l === 'FR' ? 'Français' : 'العربية'}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link to="/auth/login">
              <span className="text-sm font-semibold hover:text-gray-300 transition-colors px-4">{t.login}</span>
            </Link>
            <Link to="/auth/register">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 text-sm font-semibold">{t.signup}</Button>
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
              <a href="#about" onClick={() => setIsMenuOpen(false)}>{t.navAbout}</a>
              <a href="#features" onClick={() => setIsMenuOpen(false)}>{t.navFeatures}</a>
              <a href="#register-guide" onClick={() => setIsMenuOpen(false)}>{t.navRegister}</a>
            </nav>
            
            <div className="h-px bg-white/10 mb-8" />
            
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">Language</p>
              <div className="flex gap-4">
                {['EN', 'FR', 'AR'].map((l) => (
                  <button 
                    key={l}
                    onClick={() => { setLang(l); setIsMenuOpen(false); }}
                    className={`px-3 py-1 rounded-full text-sm font-bold border ${lang === l ? 'bg-primary border-primary text-white' : 'border-white/20 text-white'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-4">
              <Link to="/auth/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full h-12 text-white border-white/20 bg-transparent hover:bg-white/10">{t.login}</Button>
              </Link>
              <Link to="/auth/register" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full h-12 bg-primary text-white">{t.signup}</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Hero Content */}
        <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 flex flex-col justify-center py-20 lg:py-0">
          <div className={lang === 'AR' ? 'text-right' : 'text-left'}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
              {t.heroTitle1}<br/>
              <span className="text-primary block mt-2">{t.heroTitle2}</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-200 mt-6 max-w-2xl leading-relaxed font-medium">
              {t.heroSub}
            </p>
            <div className="flex flex-wrap gap-4 mt-10">
              <Link to="/auth/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white rounded-md px-8 h-12 text-base font-semibold shadow-xl">
                  {t.getStarted} <ArrowUpRight className={`${lang === 'AR' ? 'mr-2 rotate-270' : 'ml-2'} h-5 w-5`} />
                </Button>
              </Link>
              <Link to="#about" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-md px-8 h-12 text-base font-semibold text-white border-white/30 bg-transparent hover:bg-white/10 transition-all">
                  {t.learnMore} <ArrowUpRight className={`${lang === 'AR' ? 'mr-2 rotate-270' : 'ml-2'} h-5 w-5`} />
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* WHAT IS VETO CARE */}
      <section id="about" className="py-20 lg:py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-24 ${lang === 'AR' ? 'lg:flex-row-reverse' : ''}`}>
            
            {/* Content Column */}
            <div className={`flex-1 ${lang === 'AR' ? 'text-right' : 'text-left'}`}>
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-bold mb-6">
                {t.aboutBadge}
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6 leading-tight text-[#0D3B23]">
                {t.aboutTitle.split('\n').map((line, i) => (
                  <span key={i}>{line}{i === 0 && <br/>}</span>
                ))}
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-gray-500 max-w-xl">
                {t.aboutDesc}
              </p>
            </div>

            {/* Image Column */}
            <div className="flex-1 relative w-full max-w-md lg:max-w-none mt-12 lg:mt-0">
              <div className={`absolute inset-0 bg-primary/10 rounded-[1.5rem] sm:rounded-[2rem] transform ${lang === 'AR' ? 'rotate-3 lg:rotate-6 -translate-x-3 lg:-translate-x-4' : '-rotate-3 lg:-rotate-6 translate-x-3 lg:translate-x-4'} -translate-y-3 lg:-translate-y-4`}></div>
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
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t.featTitle}</h2>
            <p className="mt-4 text-base sm:text-lg text-gray-500">{t.featSub}</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { id: 1, icon: Calendar, title: t.feat1Title, desc: t.feat1Desc },
              { id: 2, icon: Stethoscope, title: t.feat2Title, desc: t.feat2Desc },
              { id: 3, icon: Bell, title: t.feat3Title, desc: t.feat3Desc },
              { id: 4, icon: MessageSquare, title: t.feat4Title, desc: t.feat4Desc },
              { id: 5, icon: Clock, title: t.feat5Title, desc: t.feat5Desc },
              { id: 6, icon: PawPrint, title: t.feat6Title, desc: t.feat6Desc },
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
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t.regTitle}</h2>
            <p className="mt-4 text-base sm:text-lg text-gray-500">{t.regSub}</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {[
              { id: 'owner', icon: PawPrint, title: t.regOwner, steps: [t.regOwnerStep1, t.regOwnerStep2, t.regOwnerStep3] },
              { id: 'vet', icon: Stethoscope, title: t.regVet, steps: [t.regVetStep1, t.regVetStep2, t.regVetStep3] },
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
          <p className="text-sm sm:text-base">{t.footer}</p>
        </div>
      </footer>
    </div>
  )
}
