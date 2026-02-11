import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface StatsCardProps {
    label: string
    value: string
    icon: LucideIcon
    color: string
    trend: string
    trendUp?: boolean
}

export function StatsCard({ label, value, icon: Icon, color, trend, trendUp }: StatsCardProps) {
    return (
        <div className="glass p-6 rounded-3xl group hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-2xl bg-current/10", color)}>
                    <Icon className="w-6 h-6" />
                </div>
                <span className={cn(
                    "text-xs font-bold px-2 py-1 rounded-full",
                    trendUp ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                )}>
                    {trend}
                </span>
            </div>
            <p className="text-muted-foreground text-sm font-semibold mb-1">{label}</p>
            <h3 className="text-2xl font-bold text-foreground">{value}</h3>
        </div>
    )
}
