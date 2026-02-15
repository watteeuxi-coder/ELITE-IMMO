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
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [step, setStep] = useState<ConversationStep>('greeting')
    const { leads, updateLead, activeLead: storeActiveLead, calculateScore, syncChat } = useStore()
    const scrollRef = useRef<HTMLDivElement>(null)

    // Simply find the lead
    const activeLead = leadId ? leads.find((l: Lead) => l.id === leadId) : (storeActiveLead ? leads.find((l: Lead) => l.id === storeActiveLead) : leads[0])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [activeLead?.chatHistory])

    // Initialize greeting
    useEffect(() => {
        if (activeLead && (!activeLead.chatHistory || activeLead.chatHistory.length === 0)) {
            const initialMsg = {
                role: 'ai' as const,
                message: t('chat_welcome')
            }
            syncChat(activeLead.id, initialMsg)
            setStep('name')
        }
    }, [activeLead?.id, syncChat, t])

    // Resume flow
    useEffect(() => {
        if (activeLead && activeLead.chatHistory && activeLead.chatHistory.length > 0) {
            if (activeLead.phone) setStep('complete')
            else if (activeLead.email) setStep('phone')
            else if (activeLead.entryDate) setStep('email')
            else if (activeLead.hasGuarantor !== undefined) setStep('entry_date')
            else if (activeLead.contractType) setStep('guarantor')
            else if (activeLead.income !== undefined && activeLead.income > 0) setStep('contract')
            else if (activeLead.name && activeLead.name !== 'Nouveau Prospect') setStep('income')
            else setStep('name')
        }
    }, [activeLead])

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
                const income = parseInt(userInput.replace(/[^\d]/g, ''))
                if (isNaN(income) || income < 100) {
                    aiResponse = t('chat_income_error')
                    nextStep = 'income'
                } else {
                    leadUpdates.income = income
                    aiResponse = t('chat_income_nice').replace('{income}', income.toString())
                    nextStep = 'contract'
                }
                break
            case 'contract':
                let contract: string | null = null
                if (lowerInput.includes('cdi') || lowerInput.includes('indéfini') || lowerInput.includes('permanent')) contract = 'CDI'
                else if (lowerInput.includes('cdd') || lowerInput.includes('déterminé')) contract = 'CDD'
                else if (lowerInput.includes('indep') || lowerInput.includes('free') || lowerInput.includes('auto')) contract = 'Indépendant'
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
                const isYes = lowerInput.includes('oui') || lowerInput.includes('yes') || lowerInput.includes('visale')
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
                leadUpdates.entryDate = userInput // Simple version
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
                const tempLead = { ...currentLead, ...leadUpdates }
                const finalScore = calculateScore(tempLead)
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
        if (!input.trim() || !activeLead || isThinking) return

        const userMsg = { role: 'user' as const, message: input }
        await syncChat(activeLead.id, userMsg)
        setInput('')
        setIsThinking(true)

        // Faster thinking delay or no delay for fluidity
        await new Promise(resolve => setTimeout(resolve, 500))

        const { aiResponse, nextStep, leadUpdates } = await runAIPipeline(step, input, activeLead)
        const aiMsg = { role: 'ai' as const, message: aiResponse }

        await updateLead(activeLead.id, leadUpdates)
        await syncChat(activeLead.id, aiMsg)
        setIsThinking(false)
        setStep(nextStep)
    }

    if (!activeLead) return (
        <div className="flex-1 flex items-center justify-center text-muted-foreground p-8 text-center">
            {t('chat_select_prospect')}
        </div>
    )

    return (
        <div className={cn("flex-1 flex overflow-hidden h-full", standalone ? "flex-col" : "gap-6")}>
            <div className={cn("flex flex-col overflow-hidden", standalone ? "flex-1" : "flex-[1.5] glass rounded-3xl")}>
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scroll-smooth" ref={scrollRef}>
                    {activeLead.chatHistory.map((msg, idx) => (
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
                    <div className="flex gap-2 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={t('chat_placeholder')}
                            className="flex-1 py-3 px-4 md:py-4 md:px-6 bg-white border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm md:text-base font-medium shadow-sm"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isThinking}
                            className="p-3 md:p-4 bg-primary text-white rounded-2xl hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 active:scale-95"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {!standalone && (
                <div className="flex-1 glass p-6 rounded-3xl overflow-y-auto hidden lg:block">
                    <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        {t('chat_extracted_data')}
                    </h3>
                    <div className="space-y-4">
                        <DataCard label={t('chat_full_name')} value={activeLead.name || '—'} icon={<User className="w-4 h-4" />} />
                        <DataCard label={t('chat_income')} value={activeLead.income ? `${activeLead.income}€/mois` : '—'} icon={<Clock className="w-4 h-4" />} />
                        <DataCard label={t('chat_contract')} value={activeLead.contractType || '—'} icon={<BadgeCheck className="w-4 h-4" />} />
                        <DataCard label={t('chat_entry_date')} value={activeLead.entryDate || '—'} icon={<Calendar className="w-4 h-4" />} />
                    </div>
                </div>
            )}
        </div>
    )
}

function DataCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="p-4 bg-white/50 rounded-2xl border border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground font-bold flex items-center gap-2 uppercase tracking-wider">{icon} {label}</span>
            </div>
            <p className="text-sm font-bold text-foreground">{value}</p>
        </div>
    )
}
