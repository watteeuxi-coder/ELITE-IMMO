"use client"

import React from 'react'
import { TaskCard } from './TaskCard'
import { Plus, MoreHorizontal } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useLanguage } from '../../i18n/LanguageContext'
import { useStore, Lead } from '../../store/useStore'
import { Modal } from '../common/Modal'
import { useState } from 'react'

interface ColumnProps {
    title: string
    leads: Lead[]
    status: Lead['status']
}

export function Column({ title, leads, status }: ColumnProps) {
    const { t } = useLanguage()
    const { addLead } = useStore()
    const { setNodeRef } = useDroppable({
        id: status,
    })

    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [newLeadName, setNewLeadName] = useState('')
    const [isComingSoonOpen, setIsComingSoonOpen] = useState(false)

    const handleAddLead = () => {
        if (!newLeadName.trim()) return

        const newLead: Lead = {
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
            name: newLeadName,
            income: 0,
            contractType: 'CDI',
            hasGuarantor: false,
            entryDate: new Date().toISOString().split('T')[0],
            aiScore: 0,
            status: status,
            chatHistory: []
        }
        addLead(newLead)
        setNewLeadName('')
        setIsAddModalOpen(false)
    }

    const handleOpenMenu = () => {
        setIsComingSoonOpen(true)
    }

    return (
        <div className="flex flex-col w-80 shrink-0" ref={setNodeRef}>
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground text-sm uppercase tracking-widest">{title}</h3>
                    <span className="w-5 h-5 flex items-center justify-center bg-primary/10 text-primary text-[10px] font-black rounded-full">
                        {leads.length}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="p-1.5 text-muted-foreground hover:text-foreground transition-all hover:bg-white/50 rounded-lg shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleOpenMenu}
                        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary rounded-lg"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 space-y-4 min-h-[500px]">
                <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
                    {leads.map((lead) => (
                        <TaskCard key={lead.id} lead={lead} />
                    ))}
                </SortableContext>

                {leads.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-border/50 rounded-3xl flex items-center justify-center text-muted-foreground text-xs font-medium bg-white/20">
                        {t('kanban_empty')}
                    </div>
                )}
            </div>
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={t('kanban_add')}
            >
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{t('kanban_add_alert').replace('{title}', title)}</p>
                    <input
                        autoFocus
                        type="text"
                        value={newLeadName}
                        onChange={(e) => setNewLeadName(e.target.value)}
                        placeholder="Ex: Jean Dupont"
                        className="w-full px-6 py-4 bg-white border-2 border-border/50 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddLead()}
                    />
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="flex-1 py-4 rounded-2xl font-bold bg-secondary text-foreground hover:bg-secondary/70 transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleAddLead}
                            className="flex-1 py-4 rounded-2xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                        >
                            {t('kanban_add')}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isComingSoonOpen}
                onClose={() => setIsComingSoonOpen(false)}
                title="Elite AI Assistant"
            >
                <div className="text-center space-y-4 py-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-10 h-10 text-primary rotate-45" />
                    </div>
                    <p className="text-lg font-bold text-foreground">{t('common_coming_soon') || 'Bientôt disponible...'}</p>
                    <p className="text-sm text-muted-foreground">Cette fonctionnalité est en cours de développement.</p>
                    <button
                        onClick={() => setIsComingSoonOpen(false)}
                        className="w-full py-4 rounded-2xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                    >
                        Compris
                    </button>
                </div>
            </Modal>
        </div>
    )
}
