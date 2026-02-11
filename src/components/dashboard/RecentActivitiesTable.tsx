import React from 'react'
import { BadgeCheck } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '../../i18n/LanguageContext'
import { cn } from '../../lib/utils'

interface Activity {
    name: string
    avatar: string
    action: string
    type: 'Sale' | 'Rent' | 'Visit'
    price: string
    status: 'Complete' | 'Pending' | 'Processing'
}

export function RecentActivitiesTable() {
    const { t } = useLanguage()

    const activities: Activity[] = [
        { name: 'Ilan W.', avatar: 'IW', action: 'RDV Visite - Loft République', type: 'Visit', price: '27 Fév', status: 'Pending' },
        { name: 'Sophie Martin', avatar: 'SM', action: 'Appartement Haussmannien', type: 'Sale', price: '950,000€', status: 'Complete' },
        { name: 'Thomas Dubois', avatar: 'TD', action: 'Studio Marais', type: 'Rent', price: '1,200€', status: 'Processing' },
        { name: 'Julie Lefebvre', avatar: 'JL', action: 'Villa Neuilly', type: 'Sale', price: '2,450,000€', status: 'Pending' },
    ]

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">{t('dash_recent_activities')}</h3>
                <Link
                    href="/leads"
                    className="text-sm font-semibold text-[#7084FF] hover:underline transition-all"
                >
                    {t('dash_view_all')}
                </Link>
            </div>

            <div className="space-y-3">
                {activities.map((activity, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/50 rounded-2xl border border-border/50 hover:bg-white transition-all">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0",
                            activity.name === 'Ilan W.' ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-primary/10 text-primary"
                        )}>
                            {activity.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">{activity.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{activity.action}</p>
                        </div>
                        <div className="text-center shrink-0">
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-[#7084FF]">
                                {activity.type === 'Visit' ? t('dash_type_visit') :
                                    activity.type === 'Sale' ? t('dash_type_sale') : t('dash_type_rent')}
                            </span>
                        </div>
                        <div className="text-right shrink-0 w-24">
                            <p className="text-sm font-bold text-foreground">{activity.price}</p>
                        </div>
                        <div className="shrink-0 hidden sm:block">
                            <span className="text-[10px] font-medium px-3 py-1.5 rounded-full bg-secondary text-muted-foreground">
                                {activity.status === 'Complete' ? t('dash_status_complete') :
                                    activity.status === 'Pending' ? t('dash_status_pending') : t('dash_status_processing')}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
