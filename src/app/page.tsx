"use client"

import { LayoutDashboard, Users, TrendingUp, Calendar as CalendarIcon } from 'lucide-react'
import { StatsCard } from '../components/dashboard/StatsCard'
import { ActivityChart } from '../components/dashboard/ActivityChart'
import { RecentActivitiesTable } from '../components/dashboard/RecentActivitiesTable'
import { UrgentDossiersSection } from '../components/dashboard/UrgentDossiersSection'
import { useLanguage } from '../i18n/LanguageContext'

export default function Home() {
  const { t } = useLanguage()
  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 uppercase">
          {t('dash_title')}
        </h1>
        <p className="text-muted-foreground font-medium">
          {t('dash_welcome')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          label={t('dash_stats_prospects')}
          value="124"
          icon={Users}
          color="blue"
          trend="+12%"
          trendUp={true}
        />
        <StatsCard
          label={t('dash_stats_investments')}
          value="42"
          icon={TrendingUp}
          color="purple"
          trend="+5%"
          trendUp={true}
        />
        <StatsCard
          label={t('dash_stats_rentals')}
          value="89"
          icon={CalendarIcon}
          color="green"
          trend="-2%"
          trendUp={false}
        />
        <StatsCard
          label={t('dash_stats_sales')}
          value="18"
          icon={LayoutDashboard}
          color="orange"
          trend="+8%"
          trendUp={true}
        />
      </div>

      {/* Chart + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-4 md:p-8 rounded-3xl min-h-[300px] md:min-h-[400px]">
          <ActivityChart />
        </div>
        <div className="glass p-4 md:p-6 rounded-3xl">
          <UrgentDossiersSection />
        </div>
      </div>

      {/* Recent Activities Table */}
      <div className="glass p-4 md:p-8 rounded-3xl overflow-x-auto">
        <RecentActivitiesTable />
      </div>
    </div>
  )
}
