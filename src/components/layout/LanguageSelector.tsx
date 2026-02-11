"use client"

import React from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { Globe } from 'lucide-react'
import { cn } from '../../lib/utils'

export function LanguageSelector({ className }: { className?: string }) {
    const { language, setLanguage } = useLanguage()

    return (
        <div className={cn("flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-border p-1 rounded-xl shadow-sm", className)}>
            <div className="w-8 h-8 flex items-center justify-center text-muted-foreground ml-1">
                <Globe className="w-4 h-4" />
            </div>
            <div className="flex bg-secondary/50 rounded-lg p-0.5">
                <button
                    onClick={() => setLanguage('fr')}
                    className={cn(
                        "px-3 py-1 rounded-md text-xs font-bold transition-all",
                        language === 'fr'
                            ? "bg-white text-primary shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    FR
                </button>
                <button
                    onClick={() => setLanguage('en')}
                    className={cn(
                        "px-3 py-1 rounded-md text-xs font-bold transition-all",
                        language === 'en'
                            ? "bg-white text-primary shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    EN
                </button>
            </div>
        </div>
    )
}
