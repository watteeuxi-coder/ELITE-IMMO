"use client"

import React, { useState, useEffect } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { useStore } from '../../store/useStore'
import {
    User,
    Mail,
    Shield,
    Bell,
    Palette,
    Check,
    CircleUser,
    Camera,
    Save,
    BadgeCheck,
    Globe
} from 'lucide-react'
import { cn } from '../../lib/utils'

export default function SettingsPage() {
    const { t } = useLanguage()
    const { userProfile, updateProfile } = useStore()
    const [formData, setFormData] = useState(userProfile)
    const [showSuccess, setShowSuccess] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        setFormData(userProfile)
    }, [userProfile])

    const handleSave = async () => {
        setIsSaving(true)
        // Simulate a small delay for premium feel
        await new Promise(resolve => setTimeout(resolve, 800))
        updateProfile(formData)
        setIsSaving(false)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2 text-foreground">
                        {t('settings_title') || 'Paramètres'}
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg">
                        {t('settings_subtitle') || 'Gérez votre compte et vos préférences.'}
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={cn(
                        "flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all shadow-xl disabled:opacity-50",
                        showSuccess
                            ? "bg-green-500 text-white shadow-green-500/20"
                            : "bg-[#7084FF] text-white shadow-[#7084FF]/30 hover:scale-[1.02] active:scale-[0.98]"
                    )}
                >
                    {isSaving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : showSuccess ? (
                        <Check className="w-5 h-5" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    <span>{showSuccess ? 'Enregistré' : isSaving ? 'Sauvegarde...' : t('settings_save') || 'Enregistrer les modifications'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="glass p-8 rounded-[2.5rem] flex flex-col items-center text-center space-y-6">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-tr from-[#7084FF] to-[#9D4EDD] flex items-center justify-center p-1">
                                <div className="w-full h-full rounded-[1.8rem] bg-white flex items-center justify-center overflow-hidden">
                                    {formData.avatar ? (
                                        <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-black text-[#7084FF]">
                                            {formData.name.charAt(0)}{formData.name.split(' ')[1]?.charAt(0) || ''}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button className="absolute bottom-1 right-1 p-3 bg-white border border-border rounded-xl shadow-lg hover:scale-110 transition-all text-[#7084FF]">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
                                {formData.name}
                                <BadgeCheck className="w-5 h-5 text-[#7084FF]" />
                            </h3>
                            <p className="text-sm text-muted-foreground font-medium">{formData.role}</p>
                        </div>

                        <div className="w-full pt-6 border-t border-border flex flex-col gap-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">ID Agent</span>
                                <span className="font-mono font-bold text-foreground">AE-2026-9X</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Membre depuis</span>
                                <span className="font-bold text-foreground">Janvier 2026</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Sections */}
                <div className="lg:col-span-2 space-y-8">
                    {/* General Section */}
                    <div className="glass p-8 rounded-[2.5rem] space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">{t('settings_general') || 'Informations Personnelles'}</h2>
                                <p className="text-xs text-muted-foreground">Modifiez votre identité sur la plateforme.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground ml-1">{t('settings_username') || 'Nom Complet'}</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-11 pr-4 py-4 bg-secondary/30 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7084FF]/20 focus:bg-white focus:border-[#7084FF] transition-all font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground ml-1">Rôle Professionnel</label>
                                <div className="relative">
                                    <BadgeCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full pl-11 pr-4 py-4 bg-secondary/30 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7084FF]/20 focus:bg-white focus:border-[#7084FF] transition-all font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-foreground ml-1">{t('settings_email') || 'Adresse Email'}</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-11 pr-4 py-4 bg-secondary/30 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7084FF]/20 focus:bg-white focus:border-[#7084FF] transition-all font-medium"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* App Preferences */}
                    <div className="glass p-8 rounded-[2.5rem] space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-500">
                                <Palette className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Préférences d'Application</h2>
                                <p className="text-xs text-muted-foreground">Personnalisez votre expérience visuelle.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <Globe className="w-5 h-5 text-muted-foreground" />
                                    <span className="font-bold text-sm text-foreground">Langue de l'interface</span>
                                </div>
                                <select className="bg-transparent border-none text-sm font-bold text-primary focus:ring-0">
                                    <option value="fr">Français (FR)</option>
                                    <option value="en">English (US)</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <Bell className="w-5 h-5 text-muted-foreground" />
                                    <span className="font-bold text-sm text-foreground">Notifications intelligentes</span>
                                </div>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7084FF]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="glass p-8 rounded-[2.5rem] space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-500">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Sécurité</h2>
                                <p className="text-xs text-muted-foreground">Gérez la protection de vos données.</p>
                            </div>
                        </div>

                        <button className="w-full py-4 bg-white border border-border rounded-2xl font-bold text-sm hover:bg-secondary/30 transition-all flex items-center justify-center gap-2">
                            <Shield className="w-4 h-4" />
                            Changer mon mot de passe
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
