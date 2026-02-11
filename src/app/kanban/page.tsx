"use client"

import React from 'react'
import { KanbanBoard } from '../../components/kanban/Board'
import { Plus, Filter, Search } from 'lucide-react'

import { useLanguage } from '../../i18n/LanguageContext'

export default function KanbanPage() {
    const { t } = useLanguage()

    return (
        <div className="flex flex-col h-full md:h-[calc(100vh-160px)] space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1 text-foreground">{t('kanban_title')}</h1>
                    <p className="text-muted-foreground font-medium text-sm">{t('kanban_subtitle')}</p>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder={t('kanban_search')}
                            className="w-full sm:w-40 md:w-48 pl-10 pr-4 py-2 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm shadow-sm transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 bg-white border border-border text-foreground p-2 md:px-4 md:py-2 rounded-xl font-bold shadow-sm hover:bg-secondary transition-all">
                        <Filter className="w-5 h-5 text-muted-foreground" />
                        <span className="hidden md:inline">{t('kanban_filters')}</span>
                    </button>
                    <button className="flex items-center gap-2 bg-primary text-white p-2 md:px-4 md:py-2 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <Plus className="w-5 h-5" />
                        <span className="hidden md:inline">{t('kanban_add')}</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <KanbanBoard />
            </div>
        </div>
    )
}
