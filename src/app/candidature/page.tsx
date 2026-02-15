"use client"

import React, { useEffect, useState } from 'react'
import { ChatWindow } from '../../components/chat/ChatWindow'
import { useStore } from '../../store/useStore'
import { Sparkles } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'

export default function CandidaturePage() {
    const { t, language } = useLanguage()
    const { fetchLeads, addLead, setActiveLead, leads } = useStore()
    const hasInitialFetch = React.useRef(false)
    const hasCreatedLead = React.useRef(false)
    const [currentLeadId, setCurrentLeadId] = useState<string | null>(null)

    useEffect(() => {
        const initialize = async () => {
            // 1. Toujours récupérer les leads existants d'abord pour peupler le store
            if (!hasInitialFetch.current) {
                try {
                    await fetchLeads()
                    hasInitialFetch.current = true
                } catch (e) {
                    console.error("Initial fetch failed", e)
                }
            }

            const generateUUID = () => {
                if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                    return crypto.randomUUID();
                }
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            };

            const validateUUID = (id: string) => {
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                return uuidRegex.test(id);
            };

            const savedLeadId = localStorage.getItem('elite_current_lead_id');
            const storeLeads = useStore.getState().leads;

            // Si on a un ID sauvegardé, on vérifie sa validité ET son existence en base
            if (savedLeadId && validateUUID(savedLeadId)) {
                const existingLead = storeLeads.find(l => l.id === savedLeadId);
                if (existingLead) {
                    setCurrentLeadId(savedLeadId);
                    setActiveLead(savedLeadId);
                    return;
                } else {
                    console.warn("Lead ID in localStorage not found in Supabase. Generating new one.");
                }
            }

            if (hasCreatedLead.current) return;

            const newLeadId = generateUUID();
            const newLead = {
                id: newLeadId,
                name: '',
                income: 0,
                contractType: 'CDI',
                hasGuarantor: false,
                status: 'new' as const,
                aiScore: 0,
                chatHistory: []
            } as any

            await addLead(newLead);
            setActiveLead(newLeadId);
            setCurrentLeadId(newLeadId);
            localStorage.setItem('elite_current_lead_id', newLeadId);
            hasCreatedLead.current = true;
        }

        initialize();
    }, [addLead, setActiveLead, fetchLeads])

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#E0E7FF] via-white to-[#F8FAFC] flex flex-col relative">
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

            <div className="flex-1 flex items-center justify-center px-4 md:px-12 pb-8">
                <div className="w-full max-w-[1000px] h-full max-h-[800px]">
                    {currentLeadId ? (
                        <div className="h-full backdrop-blur-2xl bg-white/80 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/40 overflow-hidden">
                            <ChatWindow leadId={currentLeadId} standalone={true} />
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full py-6 text-center">
                <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">
                    {t('chat_dossier_footer')}
                </p>
            </div>
        </div>
    )
}
