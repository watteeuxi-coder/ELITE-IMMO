"use client"

import React, { useEffect } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ToastProps {
    message: string
    action?: {
        label: string
        onClick: () => void
    }
    onClose: () => void
    duration?: number
}

export function Toast({ message, action, onClose, duration = 5000 }: ToastProps) {
    useEffect(() => {
        if (!action) {
            const timer = setTimeout(onClose, duration)
            return () => clearTimeout(timer)
        }
    }, [action, duration, onClose])

    return (
        <div className="fixed bottom-8 right-8 glass-strong p-5 rounded-2xl shadow-2xl border-2 border-primary/20 z-50 min-w-[320px] animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                    <p className="font-bold text-foreground text-sm">{message}</p>
                    {action && (
                        <button
                            onClick={action.onClick}
                            className="mt-3 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                        >
                            {action.label}
                        </button>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-secondary rounded-lg transition-all flex-shrink-0"
                >
                    <X className="w-4 h-4 text-muted-foreground" />
                </button>
            </div>
        </div>
    )
}
