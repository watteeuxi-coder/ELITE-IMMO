"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, User, BadgeCheck, Clock, FileText, Calendar } from 'lucide-react'
import { MessageBubble } from './MessageBubble'
import { cn } from '../../lib/utils'
import { useStore, Lead, ChatMessage } from '../../store/useStore'
import { useLanguage } from '../../i18n/LanguageContext'

type ConversationStep = 'greeting' | 'name' | 'income' | 'contract' | 'contract_other' | 'guarantor' | 'entry_date' | 'email' | 'phone' | 'complete'

export function ChatWindow({ leadId, standalone = false }: { leadId?: string; standalone?: boolean }) {
    const { t, language } = useLanguage()
    const [input, setInput] = useState('')
    const [isThinking, setIsThinking] = useState(false)
    const [step, setStep] = useState<ConversationStep>('greeting')
    const { leads, updateLead, activeLead: storeActiveLead, calculateScore, syncChat, addNotification } = useStore()
    const scrollRef = useRef<HTMLDivElement>(null)

    // Historique local pour l'affichage immédiat (optimistic)
    const [localHistory, setLocalHistory] = useState<ChatMessage[]>([])

    // Accumulateur local pour les données du prospect (pour éviter les pertes pendant la synchro)
    const [localLeadData, setLocalLeadData] = useState<Partial<Lead>>({})

    // Recherche du lead dans le store
    const storeLead = leadId ? leads.find((l: Lead) => l.id === leadId) : (storeActiveLead ? leads.find((l: Lead) => l.id === storeActiveLead) : leads[0])

    // Fusion des données : Store > Local > Valeurs par défaut
    const currentLead = React.useMemo(() => {
        const base = storeLead || { id: leadId || 'temp', name: '', chatHistory: [], aiScore: 0 } as any;
        return { ...base, ...localLeadData };
    }, [storeLead, localLeadData, leadId])

    // L'historique affiché
    const displayedHistory = React.useMemo(() => {
        if (!storeLead || !storeLead.chatHistory || storeLead.chatHistory.length === 0) return localHistory;
        return storeLead.chatHistory;
    }, [storeLead?.chatHistory, localHistory])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [displayedHistory, isThinking, step])

    // Initialisation immédiate du message de bienvenue
    useEffect(() => {
        if (displayedHistory.length === 0 && (storeLead || leadId)) {
            const initialMsg = {
                role: 'ai' as const,
                message: t('chat_welcome')
            }
            setLocalHistory([initialMsg])
            const targetId = storeLead?.id || leadId
            if (targetId) {
                syncChat(targetId, initialMsg)

                // Notification nouveau prospect dès le début
                addNotification({
                    lead_id: targetId,
                    type: 'new_lead',
                    message_key: 'notif_new_lead',
                })
            }
            setStep('name')
        }
    }, [storeLead?.id, leadId, displayedHistory.length, syncChat, t, addNotification])

    // Reprise du flux automatique basée sur les données fusionnées
    useEffect(() => {
        if (currentLead) {
            if (currentLead.phone) setStep('complete')
            else if (currentLead.email) setStep('phone')
            else if (currentLead.entryDate) setStep('email')
            else if (currentLead.hasGuarantor !== undefined) setStep('entry_date')
            else if (currentLead.contractType) setStep('guarantor')
            else if (currentLead.income !== undefined && currentLead.income > 0) setStep('contract')
            else if (currentLead.name && currentLead.name !== 'Nouveau Prospect' && currentLead.name !== '') setStep('income')
        }
    }, [currentLead])

    const runAIPipeline = async (currentStep: ConversationStep, userInput: string, targetLead: Lead) => {
        let aiResponse = ''
        let nextStep: ConversationStep = currentStep
        const leadUpdates: Partial<Lead> = {}
        const lowerInput = userInput.toLowerCase()

        switch (currentStep) {
            case 'name':
                leadUpdates.name = userInput
                aiResponse = t('chat_name_nice').replace('{name}', userInput)
                nextStep = 'income'
                break
            case 'income':
                const incomeVal = parseInt(userInput.replace(/[^\d]/g, ''))
                if (isNaN(incomeVal) || incomeVal < 100) {
                    aiResponse = t('chat_income_error')
                    nextStep = 'income'
                } else {
                    leadUpdates.income = incomeVal
                    aiResponse = t('chat_income_nice').replace('{income}', incomeVal.toString())
                    nextStep = 'contract'
                }
                break
            case 'contract':
                let contract: string | null = null
                if (lowerInput.includes('cdi') || lowerInput.includes('indéfini')) contract = 'CDI'
                else if (lowerInput.includes('cdd') || lowerInput.includes('déterminé')) contract = 'CDD'
                else if (lowerInput.includes('indep') || lowerInput.includes('free')) contract = 'Indépendant'
                else if (lowerInput.includes('altern') || lowerInput.includes('stage')) contract = 'Alternance'

                if (!contract) {
                    aiResponse = t('chat_contract_error')
                    nextStep = 'contract'
                } else {
                    leadUpdates.contractType = contract
                    aiResponse = t('chat_contract_ask')
                    nextStep = 'guarantor'
                }
                break
            case 'guarantor':
                const isYes = lowerInput.includes('oui') || lowerInput.includes('yes')
                const isNo = lowerInput.includes('non') || lowerInput.includes('no')
                if (!isYes && !isNo) {
                    aiResponse = t('chat_guarantor_error')
                    nextStep = 'guarantor'
                } else {
                    leadUpdates.hasGuarantor = isYes
                    aiResponse = t('chat_entry_ask')
                    nextStep = 'entry_date'
                }
                break
            case 'entry_date':
                leadUpdates.entryDate = userInput
                aiResponse = t('chat_email_ask')
                nextStep = 'email'
                break
            case 'email':
                leadUpdates.email = userInput.trim()
                aiResponse = t('chat_phone_ask')
                nextStep = 'phone'
                break
            case 'phone':
                leadUpdates.phone = userInput.trim()
                const finalScore = calculateScore({ ...targetLead, ...leadUpdates })
                const isQualified = finalScore >= 80
                leadUpdates.aiScore = finalScore
                leadUpdates.status = isQualified ? 'qualified' : 'new'

                if (isQualified) {
                    addNotification({
                        lead_id: targetLead.id,
                        type: 'qualified',
                        message_key: 'notif_qualified_lead',
                    })
                }

                aiResponse = t('chat_complete').replace('{score}', finalScore.toString())
                nextStep = 'complete'
                break
            default:
                aiResponse = t('chat_default')
        }

        return { aiResponse, nextStep, leadUpdates }
    }

    const handleSend = async (forcedValue?: string) => {
        const valToUse = forcedValue || input;
        if (!valToUse.trim() || !currentLead || isThinking) return

        const userMsg = { role: 'user' as const, message: valToUse }
        setLocalHistory(prev => [...prev, userMsg])
        setInput('')
        setIsThinking(true)

        const targetId = currentLead.id
        console.log(`Sending message to lead ${targetId}:`, userMsg.message)

        await syncChat(targetId, userMsg)

        await new Promise(resolve => setTimeout(resolve, 600))

        const { aiResponse, nextStep, leadUpdates } = await runAIPipeline(step, valToUse, currentLead)
        const aiMsg = { role: 'ai' as const, message: aiResponse }

        setLocalHistory(prev => [...prev, aiMsg])
        setLocalLeadData(prev => ({ ...prev, ...leadUpdates }))

        console.log(`Updating lead ${targetId} with pipeline data:`, leadUpdates)
        await updateLead(targetId, leadUpdates)
        await syncChat(targetId, aiMsg)

        setIsThinking(false)
        setStep(nextStep)
    }

    if (!currentLead && !leadId) return (
        <div className="flex-1 flex items-center justify-center p-8 text-center text-muted-foreground italic">
            {t('chat_select_prospect')}
        </div>
    )

    return (
        <div className={cn("flex-1 flex overflow-hidden h-full", standalone ? "flex-col" : "gap-6")}>
            <div className={cn("flex flex-col overflow-hidden", standalone ? "flex-1" : "flex-[1.5] glass rounded-3xl")}>
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 shadow-inner" ref={scrollRef}>
                    {displayedHistory.map((msg, idx) => (
                        <MessageBubble key={idx} role={msg.role} message={msg.message} />
                    ))}

                    {isThinking && (
                        <div className="flex justify-start">
                            <div className="bg-white/80 backdrop-blur-md border border-primary/10 py-3 px-5 rounded-2xl rounded-tl-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
                                <div className="flex gap-1.5">
                                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-duration:0.8s]" />
                                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]" />
                                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]" />
                                </div>
                                <span className="text-xs font-bold text-primary/40 uppercase tracking-widest animate-pulse">{t('chat_thinking')}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 md:p-6 border-t border-border/50 bg-white/50 backdrop-blur-sm relative">
                    {/* Boutons d'options ANCRÉS (Repro "tout à l'heure") */}
                    {!isThinking && step === 'contract' && (
                        <div className="flex flex-wrap gap-2 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {['CDI', 'CDD', 'Alternance', 'Indépendant', 'Autre'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => handleSend(type)}
                                    className="px-4 py-2 bg-white border-2 border-primary/10 rounded-xl text-xs sm:text-sm font-bold text-primary hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm hover:shadow-md active:scale-95"
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    )}

                    {!isThinking && step === 'guarantor' && (
                        <div className="flex gap-2 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <button
                                onClick={() => handleSend(t('chat_yes'))}
                                className="px-8 py-2 bg-white border-2 border-green-100 rounded-xl text-xs sm:text-sm font-bold text-green-600 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all shadow-sm hover:shadow-md active:scale-95"
                            >
                                {t('chat_yes')}
                            </button>
                            <button
                                onClick={() => handleSend(t('chat_no'))}
                                className="px-8 py-2 bg-white border-2 border-red-100 rounded-xl text-xs sm:text-sm font-bold text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm hover:shadow-md active:scale-95"
                            >
                                {t('chat_no')}
                            </button>
                        </div>
                    )}

                    <div className="flex gap-2 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder={t('chat_placeholder')}
                            className="flex-1 py-3 px-4 md:py-4 md:px-6 bg-white border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base shadow-sm"
                        />
                        <button
                            id="chat-send-btn"
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isThinking}
                            className="p-3 md:p-4 bg-primary text-white rounded-2xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {!standalone && currentLead && (
                <div className="flex-1 glass p-6 rounded-3xl overflow-y-auto hidden lg:block border border-white/20">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6 opacity-50 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> {t('chat_extracted_data')}
                    </h3>
                    <div className="space-y-4">
                        <DataCard label={t('chat_full_name')} value={currentLead.name || '—'} icon={<User className="w-4 h-4" />} />
                        <DataCard label={t('chat_income')} value={currentLead.income ? `${currentLead.income}€/mois` : '—'} icon={<Clock className="w-4 h-4" />} />
                        <DataCard label={t('chat_contract')} value={currentLead.contractType || '—'} icon={<BadgeCheck className="w-4 h-4" />} />
                        <DataCard label={t('chat_entry_date')} value={currentLead.entryDate || '—'} icon={<Calendar className="w-4 h-4" />} />
                    </div>
                </div>
            )}
        </div>
    )
}

function DataCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="p-4 bg-white/50 rounded-2xl border border-border/50 shadow-sm hover:border-primary/20 transition-colors group">
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-2 mb-1 opacity-70 group-hover:text-primary transition-colors">{icon} {label}</span>
            <p className="text-sm font-bold text-primary">{value}</p>
        </div>
    )
}
