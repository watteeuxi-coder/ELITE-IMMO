"use client"

import React, { useEffect, useState } from 'react'
import { ChatWindow } from '../../components/chat/ChatWindow'
import { useStore } from '../../store/useStore'
import { Sparkles } from 'lucide-react'

export default function CandidaturePage() {
    const { leads, addLead, setActiveLead } = useStore()
    const [currentLeadId, setCurrentLeadId] = useState<string | null>(null)

    useEffect(() => {
        // Create a new lead automatically when the page loads
        if (!currentLeadId) {
            const newLeadId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
            const newLead = {
                id: newLeadId,
                name: '',
                status: 'new' as const,
                aiScore: 0,
                income: 0,
                contractType: 'CDD' as const,
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
        <div className="min-h-screen w-full bg-gradient-to-br from-[#E0E7FF] via-white to-[#F8FAFC] flex flex-col">
            {/* Minimalist Header */}
            <div className="w-full py-6 px-4 md:px-8 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7084FF] to-[#9D4EDD] flex items-center justify-center shadow-lg shadow-primary/20">
                        <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#7084FF] to-[#9D4EDD] bg-clip-text text-transparent">
                            Elite-Immo
                        </h1>
                        <p className="text-sm text-muted-foreground">Votre dossier en 3 minutes</p>
                    </div>
                </div>
            </div>

            {/* Fullscreen Chat Container with Glassmorphism */}
            <div className="flex-1 flex items-center justify-center px-4 md:px-8 pb-8">
                <div className="w-full max-w-[900px] h-full max-h-[700px]">
                    {currentLeadId && (
                        <div className="h-full backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl shadow-primary/10 border border-white/20 overflow-hidden">
                            <ChatWindow leadId={currentLeadId} standalone={true} />
                        </div>
                    )}
                </div>
            </div>

            {/* Subtle Footer */}
            <div className="w-full py-4 text-center">
                <p className="text-xs text-muted-foreground/60">
                    Propulsé par <span className="font-semibold text-primary">Elite-Immo</span> © 2026
                </p>
            </div>
        </div>
    )
}
