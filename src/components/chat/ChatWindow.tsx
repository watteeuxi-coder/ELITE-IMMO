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
    const { leads, updateLead, activeLead: storeActiveLead, calculateScore, syncChat } = useStore()
    const scrollRef = useRef<HTMLDivElement>(null)

    // localHistory pour l'affichage immédiat (optimistic)
    const [localHistory, setLocalHistory] = useState<ChatMessage[]>([])

    // Recherche du lead dans le store
    const storeLead = leadId ? leads.find((l: Lead) => l.id === leadId) : (storeActiveLead ? leads.find((l: Lead) => l.id === storeActiveLead) : leads[0])

    // L'historique affiché est la fusion du store et de l'historique local (pour les nouveaux messages)
    const displayedHistory = React.useMemo(() => {
        if (!storeLead) return localHistory;

        // On fusionne en évitant les doublons si possible, ou on fait simple : 
        // Si le store est vide, on prend le local. Sinon on prend le store.
        if (!storeLead.chatHistory || storeLead.chatHistory.length === 0) return localHistory;
        return storeLead.chatHistory;
    }, [storeLead?.chatHistory, localHistory])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [displayedHistory])

    // Initialisation immédiate du message de bienvenue
    useEffect(() => {
        // Condition : si on n'a pas encore de messages du tout
        if (displayedHistory.length === 0 && (storeLead || leadId)) {
            const initialMsg = {
                role: 'ai' as const,
                message: t('chat_welcome')
            }
            // 1. Affichage immédiat local
            setLocalHistory([initialMsg])

            // 2. Sync en arrière-plan
            const targetId = storeLead?.id || leadId
            if (targetId) {
                syncChat(targetId, initialMsg)
            }

            setStep('name')
        }
    }, [storeLead?.id, leadId, displayedHistory.length, syncChat, t])

    // Reprise du flux automatique basée sur les données du lead
    useEffect(() => {
        if (storeLead) {
            if (storeLead.phone) setStep('complete')
            else if (storeLead.email) setStep('phone')
            else if (storeLead.entryDate) setStep('email')
            else if (storeLead.hasGuarantor !== undefined) setStep('entry_date')
            else if (storeLead.contractType) setStep('guarantor')
            else if (storeLead.income !== undefined && storeLead.income > 0) setStep('contract')
            else if (storeLead.name && storeLead.name !== 'Nouveau Prospect') setStep('income')
            else if (displayedHistory.length > 0) setStep('name')
        }
    }, [storeLead])

    const runAIPipeline = async (currentStep: ConversationStep, userInput: string, currentLead: Lead) => {
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
                else if (lowerInput.includes('altern') || lowerInput.includes('stage')) contract = 'CDD'

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
                const finalScore = calculateScore({ ...currentLead, ...leadUpdates })
                leadUpdates.aiScore = finalScore
                leadUpdates.status = finalScore >= 80 ? 'qualified' : 'new'
                aiResponse = t('chat_complete').replace('{score}', finalScore.toString())
                nextStep = 'complete'
                break
            default:
                aiResponse = t('chat_default')
        }

        return { aiResponse, nextStep, leadUpdates }
    }

    const handleSend = async () => {
        const targetLead = storeLead || ({ id: leadId, name: '', chatHistory: displayedHistory } as Lead)
        if (!input.trim() || !targetLead || isThinking) return

        const userMsg = { role: 'user' as const, message: input }

        // Optimistic UI
        setLocalHistory(prev => [...prev, userMsg])
        setInput('')
        setIsThinking(true)

        // Sync user message
        await syncChat(targetLead.id, userMsg)

        // Réponse ultra rapide
        await new Promise(resolve => setTimeout(resolve, 400))

        const { aiResponse, nextStep, leadUpdates } = await runAIPipeline(step, input, targetLead)
        const aiMsg = { role: 'ai' as const, message: aiResponse }

        // Optimistic UI for AI
        setLocalHistory(prev => [...prev, aiMsg])

        await updateLead(targetLead.id, leadUpdates)
        await syncChat(targetLead.id, aiMsg)

        setIsThinking(false)
        setStep(nextStep)
    }

    // On n'affiche plus le blocage "select prospect" si on a un leadId
    if (!storeLead && !leadId) return (
        <div className="flex-1 flex items-center justify-center p-8 text-center text-muted-foreground italic">
            {t('chat_select_prospect')}
        </div>
    )

    return (
        <div className={cn("flex-1 flex overflow-hidden h-full", standalone ? "flex-col" : "gap-6")}>
            <div className={cn("flex flex-col overflow-hidden", standalone ? "flex-1" : "flex-[1.5] glass rounded-3xl")}>
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4" ref={scrollRef}>
                    {displayedHistory.map((msg, idx) => (
                        <MessageBubble key={idx} role={msg.role} message={msg.message} />
                    ))}
                    {isThinking && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-border/50 py-3 px-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 md:p-6 border-t border-border/50 bg-white/50 backdrop-blur-sm">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={t('chat_placeholder')}
                            className="flex-1 py-3 px-4 md:py-4 md:px-6 bg-white border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base shadow-sm"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isThinking}
                            className="p-3 md:p-4 bg-primary text-white rounded-2xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {!standalone && storeLead && (
                <div className="flex-1 glass p-6 rounded-3xl overflow-y-auto hidden lg:block">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6 opacity-50 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> {t('chat_extracted_data')}
                    </h3>
                    <div className="space-y-4">
                        <DataCard label={t('chat_full_name')} value={storeLead.name || '—'} icon={<User className="w-4 h-4" />} />
                        <DataCard label={t('chat_income')} value={storeLead.income ? `${storeLead.income}€/mois` : '—'} icon={<Clock className="w-4 h-4" />} />
                        <DataCard label={t('chat_contract')} value={storeLead.contractType || '—'} icon={<BadgeCheck className="w-4 h-4" />} />
                        <DataCard label={t('chat_entry_date')} value={storeLead.entryDate || '—'} icon={<Calendar className="w-4 h-4" />} />
                    </div>
                </div>
            )}
        </div>
    )
}

function DataCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="p-4 bg-white/50 rounded-2xl border border-border/50 shadow-sm">
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-2 mb-1 opacity-70">{icon} {label}</span>
            <p className="text-sm font-bold text-primary">{value}</p>
        </div>
    )
}
