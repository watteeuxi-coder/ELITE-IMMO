"use client"

import React from 'react'
import { useLanguage } from '../../i18n/LanguageContext'

export default function SettingsPage() {
    const { t } = useLanguage()

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">{t('settings_title')}</h1>
                <p className="text-muted-foreground font-medium">{t('settings_subtitle')}</p>
            </div>

            {/* General Settings */}
            <div className="glass p-8 rounded-3xl space-y-6">
                <h2 className="text-xl font-bold text-foreground">{t('settings_general')}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">{t('settings_username')}</label>
                        <input
                            type="text"
                            defaultValue="Agent Elite"
                            className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7084FF]/20 focus:border-[#7084FF] transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">{t('settings_email')}</label>
                        <input
                            type="email"
                            defaultValue="agent@elite-immo.fr"
                            className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7084FF]/20 focus:border-[#7084FF] transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Notifications Settings */}
            <div className="glass p-8 rounded-3xl space-y-6">
                <h2 className="text-xl font-bold text-foreground">{t('settings_notifications')}</h2>
                <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm font-semibold text-foreground">{t('settings_new_leads')}</span>
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-[#7084FF] rounded" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm font-semibold text-foreground">{t('settings_upcoming_visits')}</span>
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-[#7084FF] rounded" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm font-semibold text-foreground">{t('settings_pipeline_updates')}</span>
                        <input type="checkbox" className="w-5 h-5 text-[#7084FF] rounded" />
                    </label>
                </div>
            </div>

            <button className="bg-[#7084FF] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-[#7084FF]/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                {t('settings_save')}
            </button>
        </div>
    )
}
