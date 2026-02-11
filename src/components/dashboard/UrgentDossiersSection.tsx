"use client"

import React from 'react'
import { AlertCircle, Clock, TrendingUp } from 'lucide-react'
import { useStore } from '../../store/useStore'
import Link from 'next/link'

import { useLanguage } from '../../i18n/LanguageContext'

export function UrgentDossiersSection() {
    const { leads } = useStore()
    const { t } = useLanguage()

    // Filter leads with score > 80 for urgent dossiers
    const urgentLeads = leads
        .filter(lead => lead.aiScore >= 80)
        .sort((a, b) => b.aiScore - a.aiScore)
        .slice(0, 5) // Max 5 leads

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">{t('dash_urgent_title')}</h3>
                <Link
                    href="/leads"
                    className="text-sm font-semibold text-[#7084FF] hover:underline"
                >
                    {t('dash_view_all')}
                </Link>
            </div>

            <div className="space-y-3">
                {urgentLeads.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                        {t('dash_urgent_empty')}
                        <br />
                        <span className="text-xs">{t('dash_urgent_empty_sub')}</span>
                    </div>
                ) : (
                    urgentLeads.map((lead) => {
                        // Determine status based on score
                        const status = lead.aiScore >= 90 ? 'urgent' : lead.aiScore >= 85 ? 'warning' : 'ok';

                        return (
                            <div key={lead.id} className="p-4 bg-white/80 rounded-2xl border border-white/50 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${status === 'urgent' ? 'bg-red-500 animate-pulse' :
                                            status === 'warning' ? 'bg-orange-500' :
                                                'bg-green-500'
                                            }`} />
                                        <p className="text-sm font-bold text-foreground">{lead.name}</p>
                                    </div>
                                    <div className="flex items-center gap-1 px-2 py-1 bg-[#7084FF]/10 rounded-lg">
                                        <TrendingUp className="w-3 h-3 text-[#7084FF]" />
                                        <span className="text-xs font-black text-[#7084FF]">{lead.aiScore}%</span>
                                    </div>
                                </div>

                                <p className="text-xs text-muted-foreground mb-2">
                                    {lead.contractType} • {lead.income}€/mois
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Clock className="w-3 h-3" />
                                        <span>{lead.entryDate || t('dash_urgent_no_date')}</span>
                                    </div>
                                    {status === 'urgent' && (
                                        <div className="flex items-center gap-1 text-xs font-bold text-red-600">
                                            <AlertCircle className="w-3 h-3" />
                                            <span>{t('dash_urgent_action')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
