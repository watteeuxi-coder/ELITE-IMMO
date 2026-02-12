import React, { useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { useStore } from '../../store/useStore'
import { Modal } from '../../components/common/Modal'
import { RefreshCw, ShieldAlert } from 'lucide-react'

export default function SettingsPage() {
    const { t } = useLanguage()
    const { resetDatabase } = useStore()
    const [isResetModalOpen, setIsResetModalOpen] = useState(false)

    const handleReset = () => {
        setIsResetModalOpen(true)
    }

    const confirmReset = () => {
        resetDatabase()
        setIsResetModalOpen(false)
    }

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

            {/* Danger Zone */}
            <div className="glass p-8 rounded-3xl space-y-6 border border-red-100 bg-red-50/10">
                <h2 className="text-xl font-bold text-red-600">{t('settings_danger_zone') || 'Zone de Danger'}</h2>
                <p className="text-sm text-muted-foreground">Ces actions sont irréversibles. Soyez prudent.</p>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-3 bg-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <RefreshCw className="w-5 h-5" />
                    {t('side_reset') || 'Réinitialiser la Base de Données'}
                </button>
            </div>

            <button className="bg-[#7084FF] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-[#7084FF]/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                {t('settings_save')}
            </button>

            {/* Reset Confirmation Modal */}
            <Modal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                title={t('settings_reset_confirm') || 'Confirmation de réinitialisation'}
            >
                <div className="space-y-6 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <ShieldAlert className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-muted-foreground">Cette action supprimera tous les prospects et réinitialisera l'application. Cette opération est irréversible.</p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsResetModalOpen(false)}
                            className="flex-1 py-4 rounded-2xl font-bold bg-secondary text-foreground hover:bg-secondary/70 transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={confirmReset}
                            className="flex-1 py-4 rounded-2xl font-bold bg-red-500 text-white shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-all"
                        >
                            Réinitialiser
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
