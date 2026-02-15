"use client"

import React, { useState } from 'react'
import { X, FileText, Image as ImageIcon, FileArchive, Calendar, User, Save, Plus } from 'lucide-react'
import { Lead, useStore, Document } from '../../store/useStore'
import { useLanguage } from '../../i18n/LanguageContext'
import { cn } from '../../lib/utils'

interface LeadDetailsPanelProps {
    lead: Lead
    isOpen: boolean
    onClose: () => void
}

const AVAILABLE_AGENTS = ['Agent Elite', 'Sophie Martin', 'Jean Dupont']

export function LeadDetailsPanel({ lead, isOpen, onClose }: LeadDetailsPanelProps) {
    const { t, language } = useLanguage()
    const { updateLead } = useStore()
    const [activeTab, setActiveTab] = useState<'info' | 'documents' | 'history'>('info')
    const [notes, setNotes] = useState(lead.agencyNotes || '')
    const [selectedAgent, setSelectedAgent] = useState(lead.assignedAgent || '')
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        await updateLead(lead.id, {
            agencyNotes: notes,
            assignedAgent: selectedAgent
        })
        setTimeout(() => setIsSaving(false), 500)
    }

    const handleAddDocument = () => {
        const newDoc: Document = {
            id: crypto.randomUUID(),
            name: `Document_${Date.now()}.pdf`,
            type: 'application/pdf',
            uploadedAt: new Date().toISOString()
        }
        updateLead(lead.id, {
            documents: [...(lead.documents || []), newDoc]
        })
    }

    const getFileIcon = (type: string) => {
        if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />
        if (type.includes('image')) return <ImageIcon className="w-5 h-5 text-blue-500" />
        return <FileArchive className="w-5 h-5 text-gray-500" />
    }

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Panel */}
            <div
                className={cn(
                    "fixed top-0 right-0 h-full w-full md:w-[500px] glass-strong z-50 shadow-2xl transition-transform duration-300 overflow-y-auto",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="sticky top-0 glass-strong border-b border-border/20 p-6 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-2xl font-black text-foreground">{lead.name}</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {language === 'fr' ? 'Fiche Prospect' : 'Prospect Details'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-secondary rounded-xl transition-all"
                    >
                        <X className="w-6 h-6 text-foreground" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border/20 px-6 bg-background/50">
                    {[
                        { id: 'info', label: language === 'fr' ? 'Informations' : 'Information' },
                        { id: 'documents', label: 'Documents' },
                        { id: 'history', label: language === 'fr' ? 'Historique' : 'History' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "px-6 py-4 font-bold text-sm transition-all border-b-2",
                                activeTab === tab.id
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {activeTab === 'info' && (
                        <>
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                                    {language === 'fr' ? 'Info Générale' : 'General Info'}
                                </h3>
                                <div className="glass p-5 rounded-2xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-muted-foreground uppercase">
                                            {t('chat_monthly_income')}
                                        </span>
                                        <span className="font-black text-foreground">{lead.income || 0}€</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-muted-foreground uppercase">
                                            {language === 'fr' ? 'Type de contrat' : 'Contract Type'}
                                        </span>
                                        <span className="font-bold text-foreground">{lead.contractType || 'N/C'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-muted-foreground uppercase">AI Score</span>
                                        <span className="font-black text-primary text-lg">{lead.aiScore}%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-muted-foreground uppercase">
                                            {t('chat_entry_date')}
                                        </span>
                                        <span className="font-bold text-foreground flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {lead.entryDate || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Agent Assignment */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    {language === 'fr' ? 'Agent Responsable' : 'Assigned Agent'}
                                </h3>
                                <select
                                    value={selectedAgent}
                                    onChange={(e) => setSelectedAgent(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-bold text-foreground"
                                >
                                    <option value="">
                                        {language === 'fr' ? 'Non assigné' : 'Unassigned'}
                                    </option>
                                    {AVAILABLE_AGENTS.map((agent) => (
                                        <option key={agent} value={agent}>
                                            {agent}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Agency Notes */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                                    {language === 'fr' ? 'Notes de l\'agence' : 'Agency Notes'}
                                </h3>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder={language === 'fr'
                                        ? 'Ajoutez des notes internes sur ce prospect...'
                                        : 'Add internal notes about this prospect...'
                                    }
                                    className="w-full h-40 px-4 py-3 bg-white dark:bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-foreground"
                                />
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        {language === 'fr' ? 'Sauvegarde...' : 'Saving...'}
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        {language === 'fr' ? 'Sauvegarder' : 'Save Changes'}
                                    </>
                                )}
                            </button>
                        </>
                    )}

                    {activeTab === 'documents' && (
                        <>
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                                    {language === 'fr' ? 'Documents' : 'Documents'}
                                </h3>
                                <button
                                    onClick={handleAddDocument}
                                    className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    {language === 'fr' ? 'Simuler upload' : 'Simulate Upload'}
                                </button>
                            </div>

                            {!lead.documents || lead.documents.length === 0 ? (
                                <div className="glass p-12 rounded-2xl text-center">
                                    <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                                    <p className="text-muted-foreground font-bold">
                                        {language === 'fr' ? 'Aucun document' : 'No documents'}
                                    </p>
                                    <p className="text-sm text-muted-foreground/70 mt-2">
                                        {language === 'fr'
                                            ? 'Cliquez sur "Simuler upload" pour ajouter un document'
                                            : 'Click "Simulate Upload" to add a document'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {lead.documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="glass p-4 rounded-2xl flex items-center gap-4 hover:bg-primary/5 transition-all"
                                        >
                                            {getFileIcon(doc.type)}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-foreground truncate">{doc.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(doc.uploadedAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'history' && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                                {language === 'fr' ? 'Historique des échanges' : 'Chat History'}
                            </h3>
                            {lead.chatHistory.length === 0 ? (
                                <div className="glass p-12 rounded-2xl text-center">
                                    <p className="text-muted-foreground font-bold">
                                        {language === 'fr' ? 'Aucun échange pour le moment' : 'No chat history yet'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {lead.chatHistory.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "glass p-4 rounded-2xl",
                                                msg.role === 'ai' ? "bg-primary/5" : "bg-secondary/50"
                                            )}
                                        >
                                            <p className="text-xs font-bold text-muted-foreground uppercase mb-2">
                                                {msg.role === 'ai' ? 'Elite AI' : lead.name}
                                            </p>
                                            <p className="text-sm text-foreground">{msg.message}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
