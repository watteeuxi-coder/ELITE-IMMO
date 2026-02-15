"use client"

import React from 'react'
import { Clock, TrendingUp } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useLanguage } from '../../i18n/LanguageContext'

export function EfficiencyCounter() {
    const { leads } = useStore()
    const { language } = useLanguage()

    // Calculate time saved: 15 minutes per prospect
    const totalProspects = leads.filter(l => !l.isArchived).length
    const minutesSaved = totalProspects * 15
    const hoursSaved = (minutesSaved / 60).toFixed(1)

    return (
        <div className="glass-strong p-6 rounded-3xl border-2 border-primary/10 relative overflow-hidden">
            {/* Decorative Gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -z-10" />

            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-sm font-black text-muted-foreground uppercase tracking-wider">
                            {language === 'fr' ? 'Temps gagné ce mois-ci' : 'Time Saved This Month'}
                        </h3>
                    </div>

                    <div className="mt-4">
                        <p className="text-4xl font-black text-foreground">
                            {hoursSaved}
                            <span className="text-2xl text-muted-foreground ml-2">
                                {language === 'fr' ? 'heures' : 'hours'}
                            </span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            {language === 'fr'
                                ? `${totalProspects} prospects traités × 15 min/prospect`
                                : `${totalProspects} prospects processed × 15 min/prospect`
                            }
                        </p>
                    </div>

                    <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                        <p className="text-xs font-bold text-foreground">
                            {language === 'fr'
                                ? '💎 Elite-Immo vous a fait gagner'
                                : '💎 Elite-Immo saved you'
                            }
                            {' '}
                            <span className="text-primary font-black">{hoursSaved} heures</span>
                            {' '}
                            {language === 'fr' ? 'de travail ce mois-ci.' : 'of work this month.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
