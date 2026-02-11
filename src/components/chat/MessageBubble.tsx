import React from 'react'
import { cn } from '../../lib/utils'
import { User, Sparkles, Pencil } from 'lucide-react'

interface MessageBubbleProps {
    role: 'user' | 'ai'
    message: string
    onEdit?: () => void
}

export function MessageBubble({ role, message, onEdit }: MessageBubbleProps) {
    const isUser = role === 'user'

    return (
        <div className={cn(
            "flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 group",
            isUser ? "flex-row-reverse" : ""
        )}>
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                isUser ? "bg-[#7084FF]" : "bg-secondary"
            )}>
                {isUser ? (
                    <User className="w-4 h-4 text-white" />
                ) : (
                    <Sparkles className="w-4 h-4 text-[#7084FF]" />
                )}
            </div>

            <div className={cn(
                "max-w-[70%] px-4 py-3 rounded-2xl transition-all relative",
                isUser
                    ? "bg-[#7084FF] text-white shadow-lg shadow-[#7084FF]/20"
                    : "bg-secondary/60 text-foreground border border-border/30"
            )}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
                {isUser && onEdit && (
                    <button
                        onClick={onEdit}
                        className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-all"
                        title="Modifier le message"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    )
}
