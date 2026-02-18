"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    KanbanSquare,
    Calendar,
    Settings,
    CircleUser,
    LogOut,
    Share2,
    Check,
    RefreshCw,
    ShieldAlert,
    X
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useLanguage } from '../../i18n/LanguageContext'
import { useStore } from '../../store/useStore'
import { Modal } from '../common/Modal'

export function Sidebar() {
    const { t, language } = useLanguage()
    const pathname = usePathname()
    const { isSidebarOpen, setSidebarOpen, userProfile } = useStore()
    const [showToast, setShowToast] = useState(false)
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

    // Reset sidebar on path change (useful for mobile)
    React.useEffect(() => {
        if (isSidebarOpen) setSidebarOpen(false)
    }, [pathname])

    const sidebarItems = [
        { name: t('side_dashboard'), icon: LayoutDashboard, href: '/' },
        { name: t('side_leads'), icon: Users, href: '/leads' },
        { name: t('side_pipeline'), icon: KanbanSquare, href: '/kanban' },
        { name: t('side_calendar'), icon: Calendar, href: '/calendar' },
    ]

    const handleShareLink = async () => {
        const link = `${window.location.origin}/candidature`
        try {
            await navigator.clipboard.writeText(link)
            setShowToast(true)
            setTimeout(() => setShowToast(false), 3000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }


    return (
        <>
            {/* Mobile Backdrop - Simplified condition and z-index */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[65] md:hidden transition-opacity pointer-events-auto"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className={cn(
                "w-64 h-screen glass-strong fixed left-0 top-0 flex flex-col p-6 z-[70] shadow-2xl transition-transform duration-300 md:translate-x-0 border-r border-white/20",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between mb-10 px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#7084FF] rounded-xl flex items-center justify-center shadow-lg shadow-[#7084FF]/20">
                            <span className="text-white font-black text-xl">E</span>
                        </div>
                        <span className="font-black text-xl tracking-tight text-[#7084FF]">ELITE-IMMO</span>
                    </div>
                    {/* Mobile Only Close Button */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-2 -mr-2 text-muted-foreground hover:text-foreground md:hidden"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 space-y-2">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => isSidebarOpen && setSidebarOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative cursor-pointer",
                                    isActive
                                        ? "bg-[#7084FF] text-white shadow-lg shadow-[#7084FF]/20"
                                        : "text-foreground hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-md"
                                )}
                            >
                                <item.icon className={cn(
                                    "w-5 h-5 transition-all",
                                    isActive ? "text-white" : "text-muted-foreground group-hover:text-[#7084FF]"
                                )} />
                                <span className={cn(
                                    "font-bold text-sm",
                                    isActive ? "text-white" : "text-foreground"
                                )}>{item.name}</span>
                            </Link>
                        )
                    })}

                    {/* Share Link Button */}
                    <button
                        onClick={handleShareLink}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-primary/10 to-[#9D4EDD]/10 hover:from-primary/20 hover:to-[#9D4EDD]/20 transition-all duration-300 border border-primary/20 mt-4"
                    >
                        <Share2 className="w-5 h-5 text-primary" />
                        <span className="font-bold text-sm text-primary">{t('side_share')}</span>
                    </button>

                </nav>

                <div className="pt-6 border-t border-border mt-auto space-y-2">

                    <Link
                        href="/settings"
                        onClick={() => isSidebarOpen && setSidebarOpen(false)}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all cursor-pointer",
                            pathname === '/settings'
                                ? "bg-[#7084FF] text-white"
                                : "text-muted-foreground hover:bg-secondary dark:hover:bg-white/10 hover:text-foreground"
                        )}
                    >
                        <Settings className="w-5 h-5" />
                        <span className="font-bold text-sm">{t('side_settings')}</span>
                    </Link>

                    {/* Reset Database Button - Visible for agencies demo */}
                    <button
                        onClick={async () => {
                            if (window.confirm(t('settings_reset_confirm'))) {
                                await useStore.getState().resetDatabase();
                                window.location.href = '/';
                            }
                        }}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all cursor-pointer text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors mt-1"
                    >
                        <RefreshCw className="w-5 h-5" />
                        <span className="font-bold text-sm">{t('side_reset')}</span>
                    </button>
                    <div className="flex items-center gap-3 px-2 py-4 mt-2">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border overflow-hidden">
                            <CircleUser className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-foreground">{userProfile.name}</span>
                            <span className="text-xs text-muted-foreground">{userProfile.role}</span>
                        </div>
                        <button
                            onClick={() => setIsLogoutModalOpen(true)}
                            className="ml-auto p-2 text-muted-foreground hover:text-destructive transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Toast Notification */}
                {showToast && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-bottom-5 duration-300">
                        <div className="bg-gradient-to-r from-[#7084FF] to-[#9D4EDD] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <Check className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">{t('side_link_copied')}</p>
                                <p className="text-xs text-white/80">{t('side_link_desc')}</p>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Modal Components - Outside the Sidebar div for global centering */}

            <Modal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                title="Déconnexion"
            >
                <div className="space-y-6 text-center py-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <LogOut className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <p className="font-bold text-lg text-foreground mb-1">Mode Démo Elite</p>
                        <p className="text-sm text-muted-foreground">La déconnexion est simulée dans cet environnement de démonstration.</p>
                    </div>
                    <button
                        onClick={() => setIsLogoutModalOpen(false)}
                        className="w-full py-4 rounded-2xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                    >
                        Continuer l'exploration
                    </button>
                </div>
            </Modal>
        </>
    )
}
