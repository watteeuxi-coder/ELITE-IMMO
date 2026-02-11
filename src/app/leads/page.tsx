"use client"

import React, { useState, useEffect } from 'react'
import { useStore, Lead } from '../../store/useStore'
import { ChatWindow } from '../../components/chat/ChatWindow'
import { cn } from '../../lib/utils'
import { Search, Filter, Plus, Trash2 } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'

export default function LeadsPage() {
    const { leads, addLead, deleteLead, fetchLeads, isLoading } = useStore()
    const { t } = useLanguage()
    const [selectedLeadId, setSelectedLeadId] = useState<string | undefined>()
    const [searchTerm, setSearchTerm] = useState('')
    const [filterOnlyQualified, setFilterOnlyQualified] = useState(false)

    useEffect(() => {
        fetchLeads()
    }, [fetchLeads])

    const handleAddNewLead = () => {
        const newLead: Lead = {
            id: crypto.randomUUID(),
            name: 'Nouveau Prospect',
            income: 0,
            contractType: 'CDI',
            hasGuarantor: false,
            entryDate: new Date().toISOString().split('T')[0],
            aiScore: 0,
            status: 'new',
            chatHistory: []
        }
        addLead(newLead)
        setSelectedLeadId(newLead.id)
    }

    const filteredLeads = leads
        .filter((lead: Lead) => lead.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter((lead: Lead) => filterOnlyQualified ? lead.aiScore > 80 : true)

    const activeLead = leads.find((l: Lead) => l.id === selectedLeadId) || filteredLeads[0]

    return (
        <div className="flex flex-col h-[calc(100vh-160px)] space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1 text-foreground">{t('leads_title')}</h1>
                    <p className="text-muted-foreground font-medium text-sm">{t('leads_subtitle')}</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder={t('leads_search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7084FF]/20 text-sm w-64 shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => setFilterOnlyQualified(!filterOnlyQualified)}
                        className={cn(
                            "p-2 border rounded-xl transition-all",
                            filterOnlyQualified ? "bg-primary/10 border-primary text-primary" : "bg-white border-border text-muted-foreground hover:bg-secondary"
                        )}
                        title={filterOnlyQualified ? t('leads_filter_all') : t('leads_filter_qualified')}
                    >
                        <Filter className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleAddNewLead}
                        className="flex items-center gap-2 bg-[#7084FF] text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-[#7084FF]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        <span>{t('nav_new_lead')}</span>
                    </button>
                </div>
            </div>

            <div className="flex gap-6 flex-1 min-h-0">
                {/* Leads List */}
                <div className="w-80 glass rounded-3xl overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-border bg-white/50">
                        <h3 className="font-bold text-foreground">{t('leads_last_prospects')}</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredLeads.map((lead: Lead) => (
                            <div key={lead.id} className="group relative">
                                <button
                                    onClick={() => setSelectedLeadId(lead.id)}
                                    className={cn(
                                        "w-full p-5 flex items-center gap-4 transition-all border-b border-border/50",
                                        activeLead?.id === lead.id ? "bg-primary/5 border-r-4 border-r-primary" : "hover:bg-secondary/30"
                                    )}
                                >
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-primary text-sm shrink-0">
                                        {lead.name ? lead.name[0] : '?'}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <p className="text-sm font-bold text-foreground truncate">{lead.name}</p>
                                            <span className="text-[10px] font-black text-primary">{lead.aiScore}%</span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground truncate">{lead.chatHistory?.length ? lead.chatHistory[lead.chatHistory.length - 1].message : t('leads_no_message')}</p>
                                    </div>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        if (confirm(t('leads_delete_confirm'))) deleteLead(lead.id)
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="flex-1 glass rounded-3xl overflow-hidden shadow-xl border border-white/50">
                    {activeLead ? (
                        <ChatWindow leadId={activeLead.id} />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-12 text-center">
                            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
                                <Search className="w-10 h-10 opacity-20" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">Aucun prospect sélectionné</h3>
                            <p className="max-w-xs">{t('leads_subtitle')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
