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

const data = [
    { name: 'Jan', sales: 40, target: 50 },
    { name: 'Feb', sales: 30, target: 45 },
    { name: 'Mar', sales: 65, target: 60 },
    { name: 'Apr', sales: 45, target: 55 },
    { name: 'May', sales: 90, target: 70 },
    { name: 'Jun', sales: 55, target: 65 },
    { name: 'Jul', sales: 75, target: 80 },
]

export function ActivityChart() {
    const { t } = useLanguage()

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
                <ComposedChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5ea" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#636366', fontSize: 12, fontWeight: 500 }}
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
                    <Bar dataKey="sales" radius={[10, 10, 10, 10]} barSize={30}>
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.sales > 60 ? '#7084FF' : '#7084FF55'}
                                className="transition-all duration-300"
                            />
                        ))}
                    </Bar>
                    <Line
                        type="monotone"
                        dataKey="target"
                        stroke="#a78bfa"
                        strokeWidth={3}
                        dot={{ fill: '#a78bfa', r: 5 }}
                        activeDot={{ r: 7 }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    )
}
