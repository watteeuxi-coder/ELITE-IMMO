"use client"

import React from 'react'
import { BadgeCheck, Clock, User } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '../../i18n/LanguageContext'
import { useStore, Lead } from '../../store/useStore'
import { cn } from '../../lib/utils'

export function RecentActivitiesTable() {
    const { t } = useLanguage()
    const { leads } = useStore()

    // Transform leads into activities
    // We show the latest leads or qualified leads as "activities"
    const activities = leads
        .slice(0, 5)
        .map(lead => ({
            id: lead.id,
            name: lead.name || 'Prospect Anonyme',
            avatar: lead.name ? lead.name[0] : '?',
            action: lead.status === 'qualified' ? t('dash_notif_qualified') : (lead.chatHistory.length > 0 ? 'Dossier en cours' : 'Nouveau prospect'),
            type: lead.status === 'qualified' ? 'Visit' : 'Rent', // Simplified mapping for UI
            price: lead.aiScore > 0 ? `${lead.aiScore}%` : '—',
            status: lead.status === 'qualified' ? 'Complete' : 'Processing',
            time: lead.entryDate || '—'
        }))

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">{t('dash_recent_activities')}</h3>
                <Link
                    href="/leads"
                    className="text-sm font-semibold text-[#7084FF] hover:underline transition-all"
                >
                    {t('dash_view_all')}
                </Link>
            </div>

            <div className="space-y-3">
                {activities.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm glass rounded-2xl">
                        Aucune activité récente.
                    </div>
                ) : (
                    activities.map((activity, i) => (
                        <div key={activity.id} className="flex items-center gap-4 p-4 bg-white/50 rounded-2xl border border-border/50 hover:bg-white transition-all group">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                {activity.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-foreground truncate">{activity.name}</p>
                                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {activity.action}
                                </p>
                            </div>
                            <div className="text-center shrink-0">
                                <span className={cn(
                                    "text-[10px] font-bold px-2.5 py-1 rounded-full",
                                    activity.status === 'Complete' ? "bg-green-50 text-green-600" : "bg-blue-50 text-[#7084FF]"
                                )}>
                                    {activity.status === 'Complete' ? t('dash_status_complete') : t('dash_status_processing')}
                                </span>
                            </div>
                            <div className="text-right shrink-0 w-24">
                                <p className="text-sm font-bold text-foreground">{activity.price}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Score IA</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
