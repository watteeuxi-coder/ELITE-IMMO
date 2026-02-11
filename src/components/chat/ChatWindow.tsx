"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, User, BadgeCheck, Clock, FileText, Calendar } from 'lucide-react'
import { MessageBubble } from './MessageBubble'
import { cn } from '../../lib/utils'
import { useStore, Lead } from '../../store/useStore'
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

    // Use provided leadId, or activeLead from store, or first lead
    const activeLead = leadId ? leads.find((l: Lead) => l.id === leadId) : (storeActiveLead ? leads.find((l: Lead) => l.id === storeActiveLead) : leads[0])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [activeLead?.chatHistory])

    // Initialize conversation if empty
    useEffect(() => {
        if (activeLead && (!activeLead.chatHistory || activeLead.chatHistory.length === 0)) {
            const initialMsg = {
                role: 'ai' as const,
                message: t('chat_welcome')
            }
            syncChat(activeLead.id, initialMsg)
            setStep('name')
        }
    }, [activeLead?.id, language])

    // Resume conversation step based on filled fields
    useEffect(() => {
        if (activeLead && activeLead.chatHistory && activeLead.chatHistory.length > 0) {
            if (activeLead.phone) setStep('complete')
            else if (activeLead.email) setStep('phone')
            else if (activeLead.entryDate) setStep('email')
            else if (activeLead.hasGuarantor !== undefined) setStep('entry_date')
            else if (activeLead.contractType) setStep('guarantor')
            else if (activeLead.income > 0) setStep('contract')
            else if (activeLead.name) setStep('income')
            else setStep('name')
        }
    }, [activeLead?.id])

    const handleSend = async () => {
        if (!input.trim() || !activeLead || isThinking) return

        const userMessage = { role: 'user' as const, message: input }
        await syncChat(activeLead.id, userMessage)

        setInput('')
        setIsThinking(true)

        // Simulate thinking delay
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000))

        let aiResponse = ''
        let nextStep: ConversationStep = step
        let leadUpdates: Partial<Lead> = {}

        const lowerInput = input.toLowerCase()

        // Robustness: Generic "I didn't understand" if input is too short or weird (demo logic)
        const isWeirdInput = input.length < 2 && step !== 'guarantor'

        if (isWeirdInput) {
            aiResponse = t('chat_generic_error')
            nextStep = step
        } else if (step === 'guarantor' && (lowerInput.includes('c\'est quoi') || lowerInput.includes('qu\'est-ce') || lowerInput.includes('comprends pas') || lowerInput.includes('what is') || lowerInput.includes('don\'t understand'))) {
            aiResponse = t('chat_guarantor_explain')
            nextStep = 'guarantor'
        } else {
            switch (step) {
                case 'name':
                    if (lowerInput.includes('non') || lowerInput.includes('rien') || lowerInput.includes('no') || lowerInput.includes('nothing')) {
                        aiResponse = t('chat_name_demand')
                        nextStep = 'name'
                    } else {
                        leadUpdates.name = input
                        aiResponse = t('chat_name_nice').replace('{name}', input)
                        nextStep = 'income'
                    }
                    break

                case 'income':
                    const income = parseInt(input.replace(/[^\d]/g, ''))
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
                    const contract = lowerInput.includes('cdi') || lowerInput.includes('permanent') ? 'CDI' :
                        lowerInput.includes('cdd') || lowerInput.includes('fixed') ? 'CDD' :
                            lowerInput.includes('indep') || lowerInput.includes('free') || lowerInput.includes('auto') ? 'Indépendant' : null

                    if (!contract) {
                        aiResponse = t('chat_contract_error')
                        nextStep = 'contract'
                    } else {
                        leadUpdates.contractType = contract as Lead['contractType']
                        aiResponse = t('chat_contract_ask')
                        nextStep = 'guarantor'
                    }
                    break

                case 'guarantor':
                    const isYes = lowerInput.includes('oui') || lowerInput.includes('yes') || lowerInput.includes('visale') || lowerInput.includes('garant') || lowerInput.includes('guarantor')
                    const isNo = lowerInput.includes('non') || lowerInput.includes('pas') || lowerInput.includes('no') || lowerInput.includes('don\'t')

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
                    if (input.length < 3) {
                        aiResponse = t('chat_date_error')
                        nextStep = 'entry_date'
                    } else {
                        leadUpdates.entryDate = input
                        aiResponse = t('chat_email_ask')
                        nextStep = 'email'
                    }
                    break

                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    if (!emailRegex.test(input.trim())) {
                        aiResponse = t('chat_email_error')
                        nextStep = 'email'
                    } else {
                        leadUpdates.email = input.trim()
                        aiResponse = t('chat_phone_ask')
                        nextStep = 'phone'
                    }
                    break

                case 'phone':
                    const phoneRegex = /^[\d\s+\-.]{8,}$/
                    if (!phoneRegex.test(input.trim())) {
                        aiResponse = t('chat_phone_error')
                        nextStep = 'phone'
                    } else {
                        leadUpdates.phone = input.trim()
                        const tempLead = { ...activeLead, ...leadUpdates }
                        const finalScore = calculateScore(tempLead)
                        leadUpdates.aiScore = finalScore
                        // Only set to 'qualified' if score >= 80
                        leadUpdates.status = finalScore >= 80 ? 'qualified' : 'new'
                        aiResponse = t('chat_complete').replace('{score}', finalScore.toString()) + " " + (finalScore >= 80 ? t('chat_complete_high') : t('chat_complete_low'))
                        nextStep = 'complete'
                    }
                    break

                default:
                    aiResponse = t('chat_default')
            }
        }

        const aiMessage = { role: 'ai' as const, message: aiResponse }

        // Update score and status in Supabase
        await updateLead(activeLead.id, leadUpdates)
        // Sync AI response
        await syncChat(activeLead.id, aiMessage)

        if (nextStep === 'complete') {
            useStore.getState().addNotification({
                lead_id: activeLead.id,
                type: 'qualified',
                message_key: 'nav_notif_qualified'
            })
        }

        setStep(nextStep)
        setIsThinking(false)
    }

    const handleContractButton = async (contractType: string) => {
        if (!activeLead || step !== 'contract') return

        const userMessage = { role: 'user' as const, message: contractType }
        const aiMessage = { role: 'ai' as const, message: t('chat_contract_success') }

        await syncChat(activeLead.id, userMessage)
        await updateLead(activeLead.id, { contractType })
        await syncChat(activeLead.id, aiMessage)

        setStep('guarantor')
    }

    const handleGuarantorButton = async (answer: 'Oui' | 'Non') => {
        if (!activeLead || step !== 'guarantor') return

        const userMessage = { role: 'user' as const, message: answer }
        const aiMessage = { role: 'ai' as const, message: t('chat_guarantor_success') }

        await syncChat(activeLead.id, userMessage)
        await updateLead(activeLead.id, { hasGuarantor: answer === 'Oui' })
        await syncChat(activeLead.id, aiMessage)

        setStep('entry_date')
    }

    if (!activeLead) return (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
            {t('chat_select_prospect')}
        </div>
    )

    return (
        <div className={cn("flex-1 flex overflow-hidden h-full", standalone ? "flex-col" : "gap-6")}>
            {/* Chat Pane */}
            <div className={cn("flex flex-col overflow-hidden", standalone ? "flex-1" : "flex-[1.5] glass rounded-3xl")}>
                {!standalone && (
                    <div className="p-6 border-b border-border bg-white/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {activeLead?.name?.[0] || 'P'}
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground">{activeLead?.name || 'Prospect'}</h3>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    {step === 'complete' ? t('chat_status_done') : t('chat_status_ongoing')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{t('chat_ia_assist')}</span>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-6 space-y-2" ref={scrollRef}>
                    {activeLead?.chatHistory?.map((msg: { role: 'user' | 'ai', message: string }, i: number) => (
                        <MessageBubble key={i} {...msg} />
                    ))}
                    {isThinking && (
                        <div className="flex items-start gap-3 animate-pulse">
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                <Sparkles className="w-4 h-4 text-[#7084FF]" />
                            </div>
                            <div className="bg-secondary/40 px-4 py-3 rounded-2xl text-xs text-muted-foreground flex items-center gap-2">
                                <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                                <span>{t('chat_thinking')}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-white/50 border-t border-border">
                    {step === 'contract' && (
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {['CDI', 'CDD', 'Alternance', 'Intérim', 'Indépendant', 'Stage'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => handleContractButton(type)}
                                    className="py-3 px-4 bg-white border-2 border-primary/20 hover:border-primary hover:bg-primary/5 rounded-2xl font-bold text-primary transition-all text-sm"
                                >
                                    {type}
                                </button>
                            ))}
                            <button
                                onClick={() => setStep('contract_other')}
                                className="col-span-2 py-3 px-4 bg-gradient-to-r from-primary/10 to-[#9D4EDD]/10 border-2 border-primary/30 hover:border-primary hover:bg-primary/5 rounded-2xl font-bold text-primary transition-all text-sm"
                            >
                                {t('chat_other')}
                            </button>
                        </div>
                    )}

                    {step === 'contract_other' && (
                        <div className="mb-4 space-y-2">
                            <input
                                type="text"
                                placeholder={t('chat_other_placeholder')}
                                className="w-full px-4 py-3 border-2 border-primary/20 bg-white rounded-2xl focus:outline-none focus:border-primary transition-all text-sm"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                        handleContractButton(e.currentTarget.value.trim())
                                    }
                                }}
                                autoFocus
                            />
                            <button
                                onClick={() => setStep('contract')}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {t('chat_back')}
                            </button>
                        </div>
                    )}

                    {step === 'guarantor' && (
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => handleGuarantorButton('Oui')}
                                className="flex-1 py-3 px-4 bg-white border-2 border-primary/20 hover:border-primary hover:bg-primary/5 rounded-2xl font-bold text-primary transition-all"
                            >
                                {t('chat_yes')}
                            </button>
                            <button
                                onClick={() => handleGuarantorButton('Non')}
                                className="flex-1 py-3 px-4 bg-white border-2 border-primary/20 hover:border-primary hover:bg-primary/5 rounded-2xl font-bold text-primary transition-all"
                            >
                                {t('chat_no')}
                            </button>
                        </div>
                    )}

                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            placeholder={editingIndex !== null ? t('chat_edit_placeholder') : t('chat_placeholder')}
                            className="w-full pr-12 pl-4 py-3 md:py-3.5 border-2 border-border bg-white/80 rounded-2xl focus:outline-none focus:border-primary transition-all placeholder:text-muted-foreground/50 text-base font-medium"
                            disabled={isThinking}
                            style={{ fontSize: '16px' }} // Prevent iOS zoom
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isThinking}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all shadow-lg shadow-primary/20"
                        >
                            <Send className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Data Pane - Hidden in standalone mode */}
            {!standalone && activeLead && (
                <div className="flex-1 glass p-6 rounded-3xl overflow-y-auto">
                    <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        {t('chat_extracted_data')}
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-white/50 rounded-2xl border border-border/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                                    <User className="w-3.5 h-3.5" />
                                    {t('chat_full_name')}
                                </span>
                                {activeLead.name && activeLead.name !== 'Nouveau Prospect' && (
                                    <BadgeCheck className="w-4 h-4 text-green-500" />
                                )}
                            </div>
                            <p className="text-sm font-bold text-foreground">
                                {activeLead.name || '—'}
                            </p>
                        </div>

                        <div className="p-4 bg-white/50 rounded-2xl border border-border/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-muted-foreground font-medium">{t('chat_monthly_income')}</span>
                                {activeLead.income > 0 && <BadgeCheck className="w-4 h-4 text-green-500" />}
                            </div>
                            <p className="text-sm font-bold text-foreground">
                                {activeLead.income > 0 ? `${activeLead.income}€/mois` : '—'}
                            </p>
                        </div>

                        <div className="p-4 bg-white/50 rounded-2xl border border-border/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-muted-foreground font-medium">{t('chat_contract_type')}</span>
                                {activeLead.contractType && <BadgeCheck className="w-4 h-4 text-green-500" />}
                            </div>
                            <p className="text-sm font-bold text-foreground">
                                {activeLead.contractType || '—'}
                            </p>
                        </div>

                        <div className="p-4 bg-white/50 rounded-2xl border border-border/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-muted-foreground font-medium">{t('chat_guarantor')}</span>
                                {activeLead.hasGuarantor !== undefined && <BadgeCheck className="w-4 h-4 text-green-500" />}
                            </div>
                            <p className="text-sm font-bold text-foreground">
                                {activeLead.hasGuarantor === true ? t('chat_yes') : activeLead.hasGuarantor === false ? t('chat_no') : '—'}
                            </p>
                        </div>

                        <div className="p-4 bg-white/50 rounded-2xl border border-border/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {t('chat_entry_date')}
                                </span>
                                {activeLead.entryDate && <BadgeCheck className="w-4 h-4 text-green-500" />}
                            </div>
                            <p className="text-sm font-bold text-foreground">
                                {activeLead.entryDate || '—'}
                            </p>
                        </div>

                        <div className="p-4 bg-white/50 rounded-2xl border border-border/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-muted-foreground font-medium">{t('chat_email')}</span>
                                {activeLead.email && <BadgeCheck className="w-4 h-4 text-green-500" />}
                            </div>
                            <p className="text-sm font-bold text-foreground">
                                {activeLead.email || '—'}
                            </p>
                        </div>

                        <div className="p-4 bg-white/50 rounded-2xl border border-border/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-muted-foreground font-medium">{t('chat_phone')}</span>
                                {activeLead.phone && <BadgeCheck className="w-4 h-4 text-green-500" />}
                            </div>
                            <p className="text-sm font-bold text-foreground">
                                {activeLead.phone || '—'}
                            </p>
                        </div>

                        <div className="mt-6 p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-primary uppercase tracking-wider">{t('chat_score_label')}</span>
                                <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                            <div className="mt-3">
                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-3xl font-bold text-primary">{activeLead.aiScore}</span>
                                    <span className="text-lg font-bold text-primary/60 mb-1">/100</span>
                                </div>
                                <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-[#9D4EDD] rounded-full transition-all duration-1000"
                                        style={{ width: `${activeLead.aiScore}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
