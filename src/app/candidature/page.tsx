"use client"

import React, { useEffect, useState } from 'react'
import { ChatWindow } from '../../components/chat/ChatWindow'
import { useStore } from '../../store/useStore'
import { Sparkles } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'

export default function CandidaturePage() {
    const { t, language } = useLanguage()
    const { leads, addLead, setActiveLead } = useStore()
    const [currentLeadId, setCurrentLeadId] = useState<string | null>(null)

    useEffect(() => {
        // Create a new lead automatically when the page loads
        if (!currentLeadId) {
            const newLeadId = crypto.randomUUID()
            const newLead = {
                id: newLeadId,
                name: '',
                status: 'new' as const,
                aiScore: 0,
                income: 0,
                contractType: 'CDI' as const,
                hasGuarantor: false,
                entryDate: '',
                chatHistory: []
            }
            addLead(newLead)
            setActiveLead(newLeadId)
            setCurrentLeadId(newLeadId)
        }
    }, [currentLeadId, addLead, setActiveLead])

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#E0E7FF] via-white to-[#F8FAFC] flex flex-col relative">
            {/* Minimalist Header */}
            <div className="w-full py-6 md:py-10 px-4 md:px-8 flex flex-col items-center justify-center gap-6">
                <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                    <div className="w-14 h-14 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-[#7084FF] to-[#9D4EDD] flex items-center justify-center shadow-xl shadow-primary/20">
                        <Sparkles className="w-8 h-8 md:w-7 md:h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-2xl font-black bg-gradient-to-r from-[#7084FF] to-[#9D4EDD] bg-clip-text text-transparent tracking-tight">
                            {language === 'fr' ? 'Elite-Immo' : 'Elite-Real Estate'}
                        </h1>
                        <p className="text-sm md:text-base font-bold text-muted-foreground">{t('chat_dossier_subtitle')}</p>
                    </div>
                </div>
            </div>

            {/* Fullscreen Chat Container with Glassmorphism */}
            <div className="flex-1 flex items-center justify-center px-4 md:px-12 pb-8">
                <div className="w-full max-w-[1000px] h-full max-h-[800px]">
                    {currentLeadId && (
                        <div className="h-full backdrop-blur-2xl bg-white/80 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/40 overflow-hidden">
                            <ChatWindow leadId={currentLeadId} standalone={true} />
                        </div>
                    )}
                </div>
            </div>

            {/* Subtle Footer */}
            <div className="w-full py-6 text-center">
                <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">
                    {t('chat_dossier_footer')}
                </p>
            </div>
        </div>
    )
}
