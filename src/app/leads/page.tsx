"use client"

import React, { useState, useEffect } from 'react'
import { useStore, Lead } from '../../store/useStore'
import { ChatWindow } from '../../components/chat/ChatWindow'
import { cn } from '../../lib/utils'
import { Search, Filter, Plus, Trash2, User } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'
import { Modal } from '../../components/common/Modal'

export default function LeadsPage() {
    const { leads, addLead, deleteLead, fetchLeads, isLoading } = useStore()
    const { t, language } = useLanguage()
    const [selectedLeadId, setSelectedLeadId] = useState<string | undefined>()
    const [searchTerm, setSearchTerm] = useState('')
    const [filterOnlyQualified, setFilterOnlyQualified] = useState(false)
    const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null)

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
        .filter((lead: Lead) => filterOnlyQualified ? lead.aiScore >= 80 : true)

    const activeLead = leads.find((l: Lead) => l.id === selectedLeadId) || filteredLeads[0]

    return (
        <div className="flex flex-col h-full lg:h-[calc(100vh-160px)] space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1 text-foreground">{t('leads_title')}</h1>
                    <p className="text-muted-foreground font-medium text-sm">{t('leads_subtitle')}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder={t('leads_search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7084FF]/20 text-sm w-full md:w-64 shadow-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilterOnlyQualified(!filterOnlyQualified)}
                            className={cn(
                                "p-2 border rounded-xl transition-all flex-1 sm:flex-none flex justify-center items-center",
                                filterOnlyQualified ? "bg-primary/10 border-primary text-primary" : "bg-white border-border text-muted-foreground hover:bg-secondary"
                            )}
                            title={filterOnlyQualified ? t('leads_filter_all') : t('leads_filter_qualified')}
                        >
                            <Filter className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleAddNewLead}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#7084FF] text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-[#7084FF]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            <span>{t('nav_new_lead')}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden md:overflow-visible">
                {/* Leads List */}
                <div className="w-full lg:w-80 glass rounded-3xl overflow-hidden flex flex-col h-[300px] lg:h-full shrink-0">
                    <div className="p-5 border-b border-border bg-white/50">
                        <h3 className="font-bold text-foreground">{t('leads_last_prospects')}</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredLeads.map((lead: Lead) => (
                            <div key={lead.id} className="group relative">
                                <button
                                    onClick={() => setSelectedLeadId(lead.id)}
                                    className={cn(
                                        "w-full p-4 flex items-center gap-3 transition-all",
                                        activeLead?.id === lead.id
                                            ? "bg-primary/10 ring-1 ring-inset ring-primary/20"
                                            : "odd:bg-white even:bg-slate-50/50 hover:bg-primary/5"
                                    )}
                                >
                                    <div className="relative shrink-0">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors shadow-inner",
                                            activeLead?.id === lead.id ? "bg-primary text-white" : "bg-primary/10 text-primary"
                                        )}>
                                            {lead.name ? lead.name[0] : '?'}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md border border-border">
                                            <User className="w-3 h-3 text-primary" />
                                        </div>
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <p className="text-sm font-bold text-foreground truncate">{lead.name}</p>
                                            <span className="text-[10px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-md shrink-0 ml-2">{lead.aiScore}%</span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            {lead.chatHistory?.length ? lead.chatHistory[lead.chatHistory.length - 1].message : t('leads_no_message')}
                                        </p>
                                    </div>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setLeadToDelete(lead)
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="flex-1 glass rounded-3xl overflow-hidden shadow-xl border border-white/50 min-h-[400px] lg:min-h-0">
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
            <Modal
                isOpen={!!leadToDelete}
                onClose={() => setLeadToDelete(null)}
                title={t('leads_delete_confirm')}
            >
                <div className="space-y-6">
                    <p className="text-muted-foreground">
                        {language === 'fr'
                            ? `Voulez-vous vraiment supprimer ${leadToDelete?.name} ?`
                            : `Are you sure you want to delete ${leadToDelete?.name}?`}
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setLeadToDelete(null)}
                            className="flex-1 py-4 rounded-2xl font-bold bg-secondary text-foreground hover:bg-secondary/70 transition-all"
                        >
                            {language === 'fr' ? 'Annuler' : 'Cancel'}
                        </button>
                        <button
                            onClick={() => {
                                if (leadToDelete) {
                                    deleteLead(leadToDelete.id)
                                    setLeadToDelete(null)
                                }
                            }}
                            className="flex-1 py-4 rounded-2xl font-bold bg-red-500 text-white shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-all"
                        >
                            {language === 'fr' ? 'Supprimer' : 'Delete'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
