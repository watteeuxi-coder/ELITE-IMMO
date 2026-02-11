"use client"

import React, { useState } from 'react'
import { Search, Bell, Settings, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '../../lib/utils'
import { useStore } from '../../store/useStore'
import { useLanguage } from '../../i18n/LanguageContext'
import { LanguageSelector } from './LanguageSelector'
import { useEffect } from 'react'

export function Navbar() {
    const { t, language } = useLanguage()
    const [showNotifications, setShowNotifications] = useState(false)
    const router = useRouter()
    const { addLead, notifications, markAllNotificationsAsRead, fetchNotifications } = useStore()
    const unreadCount = notifications.filter(n => !n.is_read).length

    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    const handleQuickAddLead = () => {
        const newLead = {
            id: crypto.randomUUID(),
            name: 'Nouveau Prospect',
            income: 0,
            contractType: 'CDI' as const,
            hasGuarantor: false,
            entryDate: new Date().toISOString().split('T')[0],
            aiScore: 0,
            status: 'new' as const,
            chatHistory: []
        }
        addLead(newLead)
        router.push(`/leads?id=${newLead.id}`)
    }

    return (
        <div className="h-20 fixed top-0 left-0 md:left-64 right-0 glass px-4 md:px-8 flex items-center justify-between z-40 border-b border-border/20">
            <div className="hidden sm:flex items-center gap-4 flex-1 max-w-xl">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={t('nav_search')}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7084FF]/20 focus:border-[#7084FF] transition-all text-sm shadow-sm"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <LanguageSelector className="hidden sm:flex border-none bg-transparent shadow-none p-0 h-auto" />

                <button
                    onClick={handleQuickAddLead}
                    className="flex items-center gap-2 bg-[#7084FF] text-white px-3 md:px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-[#7084FF]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <PlusCircle className="w-5 h-5" />
                    <span className="hidden md:inline">{t('nav_new_lead')}</span>
                </button>

                <div className="flex items-center gap-3">
                    {/* Notifications Bell */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-3 bg-white border border-border rounded-xl hover:bg-[#7084FF]/10 hover:border-[#7084FF] transition-all relative group"
                        >
                            <Bell className="w-5 h-5 text-[#7084FF]" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-border p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-foreground">{t('nav_notifications')}</h3>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={() => markAllNotificationsAsRead()}
                                            className="text-[10px] font-bold text-primary hover:text-primary/70 uppercase tracking-wider transition-colors"
                                        >
                                            {language === 'fr' ? 'Tout marquer comme lu' : 'Mark all as read'}
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                    {notifications.length === 0 ? (
                                        <div className="py-8 text-center text-muted-foreground text-sm">
                                            {language === 'fr' ? 'Aucune notification' : 'No notifications'}
                                        </div>
                                    ) : (
                                        notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                onClick={() => {
                                                    router.push(`/leads?id=${notif.lead_id}`)
                                                    setShowNotifications(false)
                                                }}
                                                className={cn(
                                                    "p-3 rounded-xl text-sm transition-all cursor-pointer border border-transparent",
                                                    notif.is_read ? "opacity-60 bg-secondary/30" : "bg-primary/5 border-primary/10 hover:bg-primary/10"
                                                )}
                                            >
                                                <p className={cn("text-foreground", !notif.is_read && "font-semibold")}>
                                                    {t(notif.message_key || `nav_notif_${notif.type}`)}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground mt-1">
                                                    {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Settings Button */}
                    <Link
                        href="/settings"
                        className="p-3 bg-white border border-border rounded-xl hover:bg-[#7084FF]/10 hover:border-[#7084FF] transition-all"
                    >
                        <Settings className="w-5 h-5 text-[#7084FF]" />
                    </Link>

                    {/* User Avatar */}
                    <div className="flex items-center gap-3 md:pl-3 md:border-l border-border">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-bold text-foreground">{t('nav_user_name')}</p>
                            <p className="text-xs text-muted-foreground">{t('nav_user_role')}</p>
                        </div>
                        <div className="w-10 h-10 bg-[#7084FF] rounded-xl flex items-center justify-center shadow-lg shadow-[#7084FF]/20">
                            <span className="text-white font-black text-sm">AE</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
