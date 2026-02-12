import React, { memo } from 'react'
import { BadgeCheck, Clock, Calendar, Trash2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Lead, useStore } from '../../store/useStore'
import { useLanguage } from '../../i18n/LanguageContext'
import { Modal } from '../common/Modal'
import { useState } from 'react'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export const TaskCard = memo(({ lead }: { lead: Lead }) => {
    const { deleteLead } = useStore()
    const { t, language } = useLanguage()
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: lead.id })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 50 : 1,
    }

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsDeleteModalOpen(true)
    }

    const confirmDelete = () => {
        deleteLead(lead.id)
        setIsDeleteModalOpen(false)
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="glass p-5 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-grab active:cursor-grabbing group border-white/40 relative overflow-hidden"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {lead.name ? lead.name[0] : '?'}
                    </div>
                    <p className="text-sm font-bold text-foreground truncate max-w-[120px]">{lead.name || t('common_new') || 'Nouveau'}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/5 rounded-xl border border-primary/10">
                        <BadgeCheck className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-black text-primary">{lead.aiScore || 0}%</span>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-3 mt-5">
                <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {t('chat_monthly_income')}</span>
                    <span className="text-foreground">{lead.income || 0}€</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {t('chat_entry_date')}</span>
                    <span className="text-foreground">{lead.entryDate || '-'}</span>
                </div>
            </div>

            <div className="mt-5 pt-5 border-t border-white/20 flex items-center justify-between">
                <span className={cn(
                    "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter",
                    lead.contractType === 'CDI' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                )}>
                    {lead.contractType || 'N/C'}
                </span>
                <div className="flex -space-x-2">
                    {[1, 2].map(n => (
                        <div key={n} className="w-7 h-7 rounded-full border-2 border-white bg-secondary/80 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                        </div>
                    ))}
                </div>
            </div>
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title={t('leads_delete_confirm')}
            >
                <div className="space-y-6">
                    <p className="text-muted-foreground">{language === 'fr' ? `Voulez-vous vraiment supprimer ${lead.name} ?` : `Are you sure you want to delete ${lead.name}?`}</p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="flex-1 py-4 rounded-2xl font-bold bg-secondary text-foreground hover:bg-secondary/70 transition-all"
                        >
                            {language === 'fr' ? 'Annuler' : 'Cancel'}
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="flex-1 py-4 rounded-2xl font-bold bg-red-500 text-white shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-all"
                        >
                            {language === 'fr' ? 'Supprimer' : 'Delete'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
})

TaskCard.displayName = 'TaskCard'
