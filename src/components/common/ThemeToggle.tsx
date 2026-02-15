"use client"

import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { cn } from '../../lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
    const context = useTheme()

    // Safety check for SSR and missing context
    if (!context) {
        return null
    }

    const { theme, toggleTheme } = context

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                "relative w-14 h-8 rounded-full transition-all duration-300 group",
                "glass border-2 border-white/40 hover:border-primary/40",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                className
            )}
            aria-label="Toggle theme"
        >
            <div className={cn(
                "absolute top-1 w-6 h-6 rounded-full transition-all duration-300",
                "bg-gradient-to-br shadow-lg flex items-center justify-center",
                theme === 'light'
                    ? "left-1 from-yellow-400 to-orange-400"
                    : "left-7 from-indigo-500 to-purple-600"
            )}>
                {theme === 'light' ? (
                    <Sun className="w-3.5 h-3.5 text-white" />
                ) : (
                    <Moon className="w-3.5 h-3.5 text-white" />
                )}
            </div>
        </button>
    )
}
