import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const SYSTEM_PROMPT = `Tu es VetoBot, l'assistant IA officiel de la plateforme Veto-Care.
Ton rôle est d'aider les propriétaires d'animaux avec des conseils généraux sur la santé animale, la nutrition, le dressage, et l'utilisation de la plateforme.
Sois toujours empathique, professionnel, chaleureux et direct.
ATTENTION: 
1. Rappelle toujours que tu es une intelligence artificielle.
2. En cas d'urgence médicale grave, tu DOIS conseiller à l'utilisateur de prendre rendez-vous avec un de nos vétérinaires sur la plateforme.`

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Bonjour ! Je suis VetoBot 🐾, votre assistant vétérinaire intelligent. Comment puis-je vous aider aujourd\'hui ?' }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isOpen])

    const FREE_MODELS = [
        'nvidia/nemotron-3-super-120b-a12b:free',
        'google/gemma-3-27b-it:free',
        'qwen/qwen3-8b:free',
    ]

    const sendMessage = async () => {
        if (!input.trim()) return

        const userMsg = { role: 'user', content: input }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsLoading(true)

        const messageHistory = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            userMsg
        ]

        let lastError = null
        for (const model of FREE_MODELS) {
            try {
                const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer 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',
                        'Content-Type': 'application/json',
                        'HTTP-Referer': window.location.href,
                        'X-OpenRouter-Title': 'Veto-Care Platform',
                    },
                    body: JSON.stringify({
                        model,
                        messages: messageHistory,
                        temperature: 0.7,
                    })
                })

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}))
                    lastError = new Error(`[${model}] ${response.status}: ${errData?.error?.message || response.statusText}`)
                    console.warn(lastError.message, '— trying next model...')
                    continue
                }

                const data = await response.json()
                if (data.choices?.[0]?.message?.content) {
                    setMessages(prev => [...prev, { role: 'assistant', content: data.choices[0].message.content }])
                    setIsLoading(false)
                    return
                }
                lastError = new Error(`[${model}] Empty response`)
            } catch (err) {
                lastError = err
                console.warn(`Model ${model} failed:`, err.message)
            }
        }

        console.error('All models failed:', lastError)
        setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, le service IA est temporairement indisponible. Veuillez réessayer dans quelques instants." }])
        setIsLoading(false)
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 left-6 z-[100] h-14 w-14 bg-teal-600 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 hover:bg-teal-700 hover:scale-105 active:scale-95 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
            >
                <MessageCircle className="h-6 w-6" />
            </button>

            <div className={`fixed bottom-6 left-6 z-[100] w-80 sm:w-96 h-[32rem] max-h-[80vh] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-left border ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>

                <div className="bg-teal-600 px-4 py-3 flex items-center justify-between text-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-white/20 rounded-full flex items-center justify-center">
                            <MessageCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">VetoBot</h3>
                            <p className="text-[10px] text-teal-100 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> En ligne
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" ref={scrollRef}>
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] px-3 py-2 text-sm rounded-2xl ${msg.role === 'user'
                                ? 'bg-teal-600 text-white rounded-br-sm'
                                : 'bg-white border text-gray-700 rounded-bl-sm'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="px-4 py-3 rounded-2xl bg-white border rounded-bl-sm flex gap-1.5">
                                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" />
                                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-3 bg-white border-t shrink-0">
                    <form
                        onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                        className="flex items-center gap-2"
                    >
                        <Input
                            placeholder="Posez votre question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="h-10 bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-teal-600 text-sm"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || !input.trim()}
                            className="h-10 w-10 bg-teal-600 hover:bg-teal-700 rounded-full shrink-0 disabled:bg-gray-200"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                    <p className="text-[9px] text-gray-400 text-center mt-2">
                        L'IA peut se tromper. Consultez un vétérinaire en cas de doute.
                    </p>
                </div>
            </div>
        </>
    )
}
