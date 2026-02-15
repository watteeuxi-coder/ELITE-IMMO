"use client"

import React, { useEffect } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Users, TrendingUp, Calendar as CalendarIcon } from 'lucide-react'
import { StatsCard } from '../components/dashboard/StatsCard'
import { ActivityChart } from '../components/dashboard/ActivityChart'
import { RecentActivitiesTable } from '../components/dashboard/RecentActivitiesTable'
import { UrgentDossiersSection } from '../components/dashboard/UrgentDossiersSection'
import { EfficiencyCounter } from '../components/dashboard/EfficiencyCounter'
import { useLanguage } from '../i18n/LanguageContext'
import { useStore } from '../store/useStore'

export default function Home() {
  const { t } = useLanguage()
  const { leads, fetchLeads } = useStore()

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const now = new Date()
  const fortyEightHoursAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000))

  const activeLeads = leads.filter(l => {
    if (l.status === 'assigned') return true
    const createdAt = l.createdAt ? new Date(l.createdAt) : fortyEightHoursAgo
    return createdAt >= fortyEightHoursAgo
  })

  const totalProspects = activeLeads.length
  const qualifiedLeads = activeLeads.filter(l => l.aiScore >= 80).length
  const assignedLeads = leads.filter(l => l.status === 'assigned').length // On garde le total des assignés pour la stat globale
  const visitLeads = activeLeads.filter(l => (l as any).entryDate && (l as any).entryDate.trim() !== '').length

  const qualifiedPercentage = totalProspects > 0 ? Math.round((qualifiedLeads / totalProspects) * 100) : 0
  const visitPercentage = totalProspects > 0 ? Math.round((visitLeads / totalProspects) * 100) : 0
  const assignedPercentage = totalProspects > 0 ? Math.round((assignedLeads / totalProspects) * 100) : 0

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
        <Link href="/leads" className="block hover:scale-[1.02] transition-transform">
          <StatsCard
            label={t('dash_stats_prospects')}
            value={totalProspects.toString()}
            icon={Users}
            color="blue"
            trend={totalProspects > 0 ? "100%" : ""}
            trendUp={true}
          />
        </Link>
        <Link href="/leads?qualified=true" className="block hover:scale-[1.02] transition-transform">
          <StatsCard
            label={t('dash_stats_qualified')}
            value={qualifiedLeads.toString()}
            icon={TrendingUp}
            color="purple"
            trend={`${qualifiedPercentage}%`}
            trendUp={true}
          />
        </Link>
        <Link href="/calendar" className="block hover:scale-[1.02] transition-transform">
          <StatsCard
            label={t('dash_stats_visits')}
            value={visitLeads.toString()}
            icon={CalendarIcon}
            color="green"
            trend={`${visitPercentage}%`}
            trendUp={true}
          />
        </Link>
        <Link href="/kanban" className="block hover:scale-[1.02] transition-transform">
          <StatsCard
            label={t('dash_stats_assigned')}
            value={assignedLeads.toString()}
            icon={LayoutDashboard}
            color="orange"
            trend={`${assignedPercentage}%`}
            trendUp={true}
          />
        </Link>
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

      {/* Efficiency Counter - New Feature */}
      <EfficiencyCounter />

      {/* Recent Activities Table */}
      <div className="glass p-4 md:p-8 rounded-3xl overflow-x-auto">
        <RecentActivitiesTable />
      </div>
    </div>
  )
}
