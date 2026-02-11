"use client"

import React from 'react'
import { TaskCard } from './TaskCard'
import { Lead } from '../../store/useStore'
import { Plus, MoreHorizontal } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useLanguage } from '../../i18n/LanguageContext'
import { useStore } from '../../store/useStore'

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

    const handleAddLead = () => {
        const newLead: Lead = {
            id: crypto.randomUUID(),
            name: 'Nouveau Prospect',
            income: 0,
            contractType: 'CDI',
            hasGuarantor: false,
            entryDate: new Date().toISOString().split('T')[0],
            aiScore: 0,
            status: status,
            chatHistory: []
        }
        addLead(newLead)
    }

    const handleOpenMenu = () => {
        alert(t('common_coming_soon') || 'Bientôt disponible...')
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
                        onClick={handleAddLead}
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
        </div>
    )
}
