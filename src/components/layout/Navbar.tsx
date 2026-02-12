"use client"

import React, { useState } from 'react'
import { Search, Bell, Settings, PlusCircle, User, Menu, X } from 'lucide-react'
import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '../../lib/utils'
import { useStore, Lead } from '../../store/useStore'
import { useLanguage } from '../../i18n/LanguageContext'
import { LanguageSelector } from './LanguageSelector'
import { useEffect } from 'react'

export function Navbar() {
    const { t, language } = useLanguage()
    const [showNotifications, setShowNotifications] = useState(false)
    const router = useRouter()
    const { addLead, notifications, markAllNotificationsAsRead, fetchNotifications, leads, isSidebarOpen, toggleSidebar, userProfile } = useStore()
    const [searchTerm, setSearchTerm] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const unreadCount = notifications.filter(n => !n.is_read).length

    const suggestions = useMemo(() => {
        if (searchTerm.length < 1) return []
        return leads.filter((lead: Lead) =>
            lead.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5)
    }, [leads, searchTerm])

    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    const handleQuickAddLead = () => {
        const newLead = {
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
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
            {/* Left Section: Mobile Menu & Search */}
            <div className="flex items-center gap-4 flex-1">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={toggleSidebar}
                    className="p-2 -ml-2 text-foreground md:hidden hover:bg-secondary rounded-xl transition-all z-50"
                >
                    {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                {/* Mobile Identity */}
                <div className="md:hidden flex items-center gap-2 pr-2 border-r border-border/50">
                    <div className="w-8 h-8 bg-[#7084FF] rounded-lg flex items-center justify-center shadow-lg shadow-[#7084FF]/20">
                        <span className="text-white font-black text-sm">E</span>
                    </div>
                </div>

                <div className="relative flex-1 max-w-md hidden sm:block">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setShowSuggestions(true)
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder={t('nav_search')}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7084FF]/20 focus:border-[#7084FF] transition-all text-sm shadow-sm"
                        />

                        {/* Search Suggestions Autocomplete */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                {suggestions.map((lead) => (
                                    <button
                                        key={lead.id}
                                        onClick={() => {
                                            router.push(`/leads?id=${lead.id}`)
                                            setSearchTerm('')
                                            setShowSuggestions(false)
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors border-b border-border last:border-0 text-left"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <User className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-foreground truncate">{lead.name}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">{lead.status}</p>
                                        </div>
                                        <div className={`text-xs font-black ${lead.aiScore >= 80 ? 'text-green-500' : lead.aiScore >= 60 ? 'text-orange-500' : 'text-red-500'}`}>
                                            {lead.aiScore}%
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Section: Actions & User Info */}
            <div className="flex items-center gap-3 md:gap-6">
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
                            className="p-2.5 md:p-3 bg-white border border-border rounded-xl hover:bg-[#7084FF]/10 hover:border-[#7084FF] transition-all relative group"
                        >
                            <Bell className="w-5 h-5 text-[#7084FF]" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 top-full mt-2 w-72 md:w-80 bg-white rounded-2xl shadow-2xl border border-border p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
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
                            <p className="text-sm font-bold text-foreground">{userProfile.name}</p>
                            <p className="text-xs text-muted-foreground">{userProfile.role}</p>
                        </div>
                        <div className="w-10 h-10 bg-[#7084FF] rounded-xl flex items-center justify-center shadow-lg shadow-[#7084FF]/20">
                            <span className="text-white font-black text-sm">
                                {userProfile.name.charAt(0)}{userProfile.name.split(' ')[1]?.charAt(0) || ''}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
