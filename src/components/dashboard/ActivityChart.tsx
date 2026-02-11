"use client"

import React from 'react'
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts'

import { useLanguage } from '../../i18n/LanguageContext'
import { useStore } from '../../store/useStore'

export function ActivityChart() {
    const { t, language } = useLanguage()
    const { leads } = useStore()

    const monthNames = language === 'fr'
        ? ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    // Group signed leads by month
    const currentYear = new Date().getFullYear()
    const leadCounts = monthNames.map((name, index) => {
        const count = leads.filter(lead => {
            if (lead.status !== 'signed') return false
            if (!lead.entryDate) return false
            const d = new Date(lead.entryDate)
            return d.getFullYear() === currentYear && d.getMonth() === index
        }).length

        return {
            name,
            sales: count,
            target: Math.max(2, Math.floor(count * 1.5)) // Dynamic target just for visuals
        }
    })

    const chartData = leadCounts

    return (
        <div className="w-full h-[350px]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-bold text-foreground">{t('dash_chart_title')}</h3>
                    <p className="text-sm text-muted-foreground">{t('dash_chart_subtitle')}</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-xs font-medium text-muted-foreground">{t('dash_chart_legend_sales')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-purple-400" />
                        <span className="text-xs font-medium text-muted-foreground">{t('dash_chart_legend_target')}</span>
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="80%">
                <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5ea" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#636366', fontSize: 10, fontWeight: 500 }}
                        dy={10}
                    />
                    <YAxis hide />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-white/95 backdrop-blur-md border border-border p-3 rounded-2xl shadow-xl">
                                        <p className="text-sm font-bold text-foreground mb-1">{t('dash_chart_legend_sales')}: {payload[0].value}</p>
                                        <p className="text-sm font-bold text-purple-500">{t('dash_chart_legend_target')}: {payload[1]?.value}</p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Bar dataKey="sales" radius={[10, 10, 10, 10]} barSize={20}>
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.sales > 0 ? '#7084FF' : '#7084FF20'}
                                className="transition-all duration-300"
                            />
                        ))}
                    </Bar>
                    <Line
                        type="monotone"
                        dataKey="target"
                        stroke="#a78bfa"
                        strokeWidth={2}
                        dot={{ fill: '#a78bfa', r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    )
}
