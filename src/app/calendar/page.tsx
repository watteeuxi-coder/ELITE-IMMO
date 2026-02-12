"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, parse, isValid } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar as CalendarIcon, Clock, MapPin, User, MoreHorizontal, Phone, Mail, ExternalLink, AlertCircle, PlusCircle } from 'lucide-react'
import 'react-day-picker/dist/style.css'
import { useStore, Lead } from '../../store/useStore'
import { useRouter } from 'next/navigation'
import { cn } from '../../lib/utils'


interface Visit {
    id: string
    leadName: string
    property: string
    time: string
    date: Date
    leadId: string
    aiScore: number
    phone?: string
    email?: string
    status: 'confirmed' | 'pending' | 'missed'
}

import { useLanguage } from '../../i18n/LanguageContext'

export default function CalendarPage() {
    const { leads } = useStore()
    const { t, language } = useLanguage()
    const router = useRouter()

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
    const [selectedVisit, setSelectedVisit] = useState<Visit | undefined>()
    const [calendarView, setCalendarView] = useState<'month' | 'week'>('month')

    const today = useMemo(() => {
        const d = new Date()
        d.setHours(0, 0, 0, 0)
        return d
    }, [])

    // Reset selected visit when date changes
    useEffect(() => {
        setSelectedVisit(undefined)
    }, [selectedDate])

    // Convert leads with entryDate to visits
    const visits = useMemo(() => {
        return leads
            .filter((lead: Lead) => lead.entryDate && lead.entryDate.trim() !== '')
            .map((lead: Lead) => {
                let parsedDate: Date

                // Try parsing different date formats
                try {
                    // Try DD/MM/YYYY format first
                    if (lead.entryDate.includes('/')) {
                        parsedDate = parse(lead.entryDate, 'dd/MM/yyyy', new Date())
                    }
                    // Try ISO format
                    else if (lead.entryDate.includes('-')) {
                        parsedDate = new Date(lead.entryDate)
                    }
                    // Try natural language or fallback
                    else {
                        parsedDate = new Date()
                        parsedDate.setDate(parsedDate.getDate() + 7)
                    }
                } catch {
                    parsedDate = new Date()
                    parsedDate.setDate(parsedDate.getDate() + 7)
                }

                // Final safety check
                if (!isValid(parsedDate)) {
                    parsedDate = new Date()
                    parsedDate.setDate(parsedDate.getDate() + 7)
                }

                const visitDate = new Date(parsedDate)
                visitDate.setHours(0, 0, 0, 0)
                const isPast = visitDate < today
                const status: 'confirmed' | 'pending' | 'missed' =
                    lead.status === 'signed' ? 'confirmed' :
                        isPast ? 'missed' : 'pending'

                return {
                    id: lead.id,
                    leadId: lead.id,
                    leadName: lead.name || 'Prospect',
                    property: t('calendar_default_activity'),
                    time: '10:00', // Default time
                    date: parsedDate,
                    aiScore: lead.aiScore || 0,
                    phone: lead.phone,
                    email: lead.email,
                    status
                }
            })
    }, [leads, t, today])

    const visitDates = useMemo(() => visits.map(v => v.date), [visits])
    const confirmedVisitDates = useMemo(() => visits.filter(v => v.status === 'confirmed').map(v => v.date), [visits])
    const pendingVisitDates = useMemo(() => visits.filter(v => v.status === 'pending').map(v => v.date), [visits])
    const missedVisitDates = useMemo(() => visits.filter(v => v.status === 'missed').map(v => v.date), [visits])
    const missedVisits = useMemo(() => visits.filter(v => v.status === 'missed'), [visits])

    const selectedVisits = useMemo(() => visits.filter(v =>
        selectedDate && isValid(v.date) && isValid(selectedDate) && format(v.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    ), [visits, selectedDate])

    // Get days of the week for the selected date
    const weekDays = useMemo(() => {
        if (!selectedDate || !isValid(selectedDate)) return []

        const start = new Date(selectedDate)
        const day = start.getDay()
        const diff = start.getDate() - day + (day === 0 ? -6 : 1) // Monday start
        const monday = new Date(start.setDate(diff))

        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(monday)
            d.setDate(monday.getDate() + i)
            return d
        })
    }, [selectedDate])

    const timeSlots = useMemo(() => Array.from({ length: 13 }, (_, i) => i + 8), []) // 8h to 20h

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2 text-foreground grad-text">{t('calendar_title')}</h1>
                    <p className="text-muted-foreground font-medium text-lg">{t('calendar_subtitle')}</p>
                </div>
                {/* View Toggle */}
                <div className="inline-flex items-center gap-1 p-1 bg-white/60 rounded-2xl shadow-sm border border-border/50 backdrop-blur-md">
                    <button
                        onClick={() => setCalendarView('month')}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${calendarView === 'month' ? 'bg-[#7084FF] text-white shadow-lg shadow-[#7084FF]/20' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        {t('calendar_view_month')}
                    </button>
                    <button
                        onClick={() => setCalendarView('week')}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${calendarView === 'week' ? 'bg-[#7084FF] text-white shadow-lg shadow-[#7084FF]/20' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        {t('calendar_view_week')}
                    </button>
                </div>
            </div>

            {/* Missed Appointments Alert */}
            {missedVisits.length > 0 && (
                <div className="glass p-6 rounded-[2.5rem] border-2 border-red-200 bg-red-50/50 shadow-xl shadow-red-500/5">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center shrink-0 shadow-inner">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-black text-red-900 mb-1">{t('calendar_missed_title')}</h3>
                            <p className="text-sm font-medium text-red-700/80 mb-4">{missedVisits.length} {language === 'fr' ? 'rendez-vous manqués à relancer d\'urgence' : 'missed appointments to reschedule urgently'}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                                {missedVisits.slice(0, 4).map((visit) => (
                                    <button
                                        key={visit.id}
                                        onClick={() => {
                                            setSelectedDate(visit.date)
                                            setSelectedVisit(visit)
                                        }}
                                        className="p-4 bg-white rounded-2xl border border-red-100 hover:border-red-400 hover:shadow-lg transition-all text-left flex items-center gap-3 active:scale-95"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                                            <User className="w-5 h-5 text-red-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-foreground truncate">{visit.leadName}</p>
                                            <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{t('calendar_recontact')}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Calendar or Weekly View */}
                <div className="xl:col-span-8 glass p-6 md:p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#7084FF]/5 rounded-full blur-3xl -mr-32 -mt-32 transition-all group-hover:bg-[#7084FF]/10" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -ml-32 -mb-32 transition-all group-hover:bg-purple-500/10" />

                    {calendarView === 'month' ? (
                        <div className="relative">
                            <style jsx global>{`
            .rdp {
              --rdp-cell-size: 55px; /* Mobile size */
              --rdp-accent-color: #7084FF;
              --rdp-background-color: rgba(112, 132, 255, 0.1);
              font-family: inherit;
              margin: 0 auto;
            }
            @media (min-width: 768px) {
              .rdp {
                --rdp-cell-size: 80px;
              }
            }
            @media (min-width: 1280px) {
              .rdp {
                --rdp-cell-size: 90px;
              }
            }
            .rdp-months {
              justify-content: center;
            }
            .rdp-caption {
              margin-bottom: 2.5rem;
            }
            .rdp-caption_label {
              font-size: 1.5rem;
              font-weight: 900;
              color: #1a1a1a;
              letter-spacing: -0.02em;
            }
            .rdp-head_cell {
              font-weight: 800;
              font-size: 0.75rem;
              color: #636366;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              padding-bottom: 1rem;
            }
            .rdp-cell {
              padding: 0.4rem;
            }
            .rdp-day {
              border-radius: 12px;
              font-weight: 700;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              font-size: 0.9rem;
              border: 2px solid transparent;
            }
            @media (min-width: 768px) {
              .rdp-day {
                border-radius: 20px;
                font-size: 1.125rem;
              }
            }
            .rdp-day:hover:not(.rdp-day_selected) {
              background-color: rgba(112, 132, 255, 0.08);
              border-color: rgba(112, 132, 255, 0.2);
              transform: translateY(-2px);
            }
            .rdp-day_selected {
              background-color: #7084FF !important;
              color: white !important;
              font-weight: 900;
              box-shadow: 0 10px 20px -5px rgba(112, 132, 255, 0.4);
            }
            .rdp-day_today {
              color: #7084FF;
              background-color: rgba(112, 132, 255, 0.05);
              border-color: rgba(112, 132, 255, 0.3);
            }
            .visit-indicator::before {
              content: '';
              position: absolute;
              top: 6px;
              right: 6px;
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background-color: #7084FF;
              box-shadow: 0 0 10px #7084FF;
            }
            .visit-confirmed::before { background-color: #16a34a; box-shadow: 0 0 10px #16a34a; }
            .visit-pending::before { background-color: #f59e0b; box-shadow: 0 0 10px #f59e0b; }
            .visit-missed::before { 
              background-color: #dc2626; 
              box-shadow: 0 0 10px #dc2626;
              animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            }
            @keyframes ping {
              75%, 100% { transform: scale(2); opacity: 0; }
            }
          `}</style>

                            <DayPicker
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                locale={language === 'fr' ? fr : undefined}
                                modifiers={{
                                    visit: visitDates,
                                    visitConfirmed: confirmedVisitDates,
                                    visitPending: pendingVisitDates,
                                    visitMissed: missedVisitDates
                                }}
                                modifiersClassNames={{
                                    visit: 'visit-indicator relative',
                                    visitConfirmed: 'visit-confirmed',
                                    visitPending: 'visit-pending',
                                    visitMissed: 'visit-missed'
                                }}
                            />
                        </div>
                    ) : (
                        /* Weekly View */
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black text-foreground">
                                    {weekDays.length > 0 && `${format(weekDays[0], language === 'fr' ? 'd MMM' : 'MMM d', { locale: language === 'fr' ? fr : undefined })} - ${format(weekDays[6], language === 'fr' ? 'd MMM yyyy' : 'MMM d, yyyy', { locale: language === 'fr' ? fr : undefined })}`}
                                </h3>
                                <div className="flex gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500" /> {t('calendar_status_confirmed')}</span>
                                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500" /> {t('calendar_status_pending')}</span>
                                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /> {t('calendar_status_missed')}</span>
                                </div>
                            </div>
                            <div className="overflow-x-auto pb-4 custom-scrollbar">
                                <div className="min-w-[900px]">
                                    {/* Header - Days of week */}
                                    <div className="grid grid-cols-8 gap-4 mb-6">
                                        <div className="text-xs font-black text-muted-foreground uppercase flex items-center justify-center border-b-2 border-transparent pb-4">{t('calendar_hour')}</div>
                                        {weekDays.map((day, idx) => (
                                            <div key={idx} className="text-center pb-4 border-b-2 border-transparent">
                                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                                                    {format(day, language === 'fr' ? 'EEEE' : 'EEEE', { locale: language === 'fr' ? fr : undefined })}
                                                </div>
                                                <div className={`text-3xl font-black w-12 h-12 flex items-center justify-center mx-auto rounded-xl transition-all ${format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
                                                    ? 'bg-[#7084FF] text-white shadow-lg shadow-[#7084FF]/30 scale-110'
                                                    : 'text-foreground'
                                                    }`}>
                                                    {format(day, 'd')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Time Grid */}
                                    <div className="space-y-3">
                                        {timeSlots.map((hour) => (
                                            <div key={hour} className="grid grid-cols-8 gap-4 min-h-[55px]">
                                                {/* Time label */}
                                                <div className="flex items-center justify-center">
                                                    <span className="text-sm font-black text-muted-foreground/60">{hour}:00</span>
                                                </div>
                                                {/* Day columns */}
                                                {weekDays.map((day, dayIdx) => {
                                                    const dayVisits = visits.filter(v =>
                                                        format(v.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                                                    )
                                                    const hourVisit = dayVisits.find(v => v.time && v.time.startsWith(hour.toString().padStart(2, '0')))

                                                    return (
                                                        <div
                                                            key={dayIdx}
                                                            className={cn(
                                                                "relative rounded-3xl p-1.5 transition-all group/cell border-2 border-transparent",
                                                                format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') ? "bg-[#7084FF]/5 border-[#7084FF]/10" : "bg-secondary/20 hover:bg-white hover:shadow-xl hover:border-[#7084FF]/20"
                                                            )}
                                                        >
                                                            {hourVisit ? (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedDate(day)
                                                                        setSelectedVisit(hourVisit)
                                                                    }}
                                                                    className={cn(
                                                                        "w-full h-full p-3 rounded-2xl text-left transition-all hover:scale-[1.05] shadow-lg flex flex-col justify-between overflow-hidden relative",
                                                                        hourVisit.status === 'confirmed'
                                                                            ? "bg-white text-green-900 border-l-4 border-green-500"
                                                                            : hourVisit.status === 'missed'
                                                                                ? "bg-white text-red-900 border-l-4 border-red-500"
                                                                                : "bg-white text-orange-900 border-l-4 border-orange-500"
                                                                    )}
                                                                >
                                                                    <div>
                                                                        <div className="font-extrabold text-xs truncate leading-tight">{hourVisit.leadName}</div>
                                                                        <div className="text-[9px] font-bold opacity-60 mt-0.5">{hourVisit.time}</div>
                                                                    </div>
                                                                    <div className="flex items-center justify-between mt-2">
                                                                        <div className={cn(
                                                                            "text-[9px] font-black px-1.5 py-0.5 rounded-lg",
                                                                            hourVisit.status === 'confirmed' ? "bg-green-100 text-green-600" :
                                                                                hourVisit.status === 'missed' ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                                                                        )}>
                                                                            {hourVisit.aiScore}%
                                                                        </div>
                                                                        <User className="w-3 h-3 opacity-20" />
                                                                    </div>
                                                                </button>
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center opacity-0 group-hover/cell:opacity-100">
                                                                    <PlusCircle className="w-5 h-5 text-[#7084FF]/30" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Visit Details Panel ("Fiche Express") */}
                <div className="xl:col-span-4 flex flex-col gap-6">
                    <div className="glass p-8 rounded-[3rem] shadow-2xl flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-[#7084FF]/10 flex items-center justify-center">
                                    <CalendarIcon className="w-6 h-6 text-[#7084FF]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-foreground leading-tight">
                                        {selectedDate ? format(selectedDate, language === 'fr' ? 'EEEE d MMMM' : 'EEEE, MMMM d', { locale: language === 'fr' ? fr : undefined }) : t('calendar_select_date')}
                                    </h3>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{selectedDate ? format(selectedDate, 'yyyy') : ''}</p>
                                </div>
                            </div>
                            {selectedVisit && (
                                <button className="p-3 hover:bg-secondary rounded-2xl transition-all">
                                    <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                                </button>
                            )}
                        </div>

                        {selectedVisit ? (
                            <div className="space-y-8 animate-in slide-in-from-right-10 duration-500 flex-1 flex flex-col">
                                {/* Lead Main Card */}
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#7084FF] to-[#9D4EDD] rounded-[2rem] blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                                    <div className="relative glass p-6 rounded-[2rem] border border-white/40 flex flex-col items-center text-center">
                                        <div className="w-24 h-24 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-4 relative">
                                            <User className="w-12 h-12 text-[#7084FF]" />
                                            <div className={cn(
                                                "absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl border-4 border-white flex items-center justify-center text-[10px] font-black text-white shadow-lg",
                                                selectedVisit.aiScore >= 80 ? 'bg-green-500 shadow-green-200' :
                                                    selectedVisit.aiScore >= 60 ? 'bg-orange-500 shadow-orange-200' :
                                                        'bg-red-500 shadow-red-200'
                                            )}>
                                                {selectedVisit.aiScore}%
                                            </div>
                                        </div>
                                        <h4 className="text-2xl font-black text-foreground mb-1">{selectedVisit.leadName}</h4>
                                        <div className="flex items-center gap-2 px-4 py-1.5 bg-secondary/50 rounded-full text-xs font-bold text-muted-foreground">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{selectedVisit.time}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Information & Actions */}
                                <div className="space-y-4 flex-1">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white/50 rounded-2xl border border-white/40">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{language === 'fr' ? 'Statut IA' : 'AI Status'}</p>
                                            <span className={`text-xs font-black px-2.5 py-1 rounded-lg inline-block ${selectedVisit.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                selectedVisit.status === 'missed' ? 'bg-red-100 text-red-700' :
                                                    'bg-orange-100 text-orange-700'
                                                }`}>
                                                {t(`calendar_status_${selectedVisit.status}`)}
                                            </span>
                                        </div>
                                        <div className="p-4 bg-white/50 rounded-2xl border border-white/40">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{language === 'fr' ? 'Priorité' : 'Priority'}</p>
                                            <span className={cn(
                                                "text-xs font-black px-2.5 py-1 rounded-lg inline-block",
                                                selectedVisit.aiScore >= 80 ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                            )}>
                                                {selectedVisit.aiScore >= 80 ? (language === 'fr' ? '⭐ Élite' : '⭐ Elite') : (language === 'fr' ? 'Normal' : 'Normal')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Quick Contact Buttons */}
                                    <div className="flex gap-3">
                                        {selectedVisit.phone && (
                                            <a href={`tel:${selectedVisit.phone}`} className="flex-1 flex flex-col items-center justify-center p-4 bg-white rounded-3xl border border-border/50 hover:bg-green-50 hover:border-green-200 transition-all group scale-down-active">
                                                <Phone className="w-5 h-5 text-green-500 mb-1 group-hover:scale-110 transition-transform" />
                                                <span className="text-[10px] font-black uppercase text-muted-foreground">{t('calendar_call')}</span>
                                            </a>
                                        )}
                                        {selectedVisit.email && (
                                            <a href={`mailto:${selectedVisit.email}`} className="flex-1 flex flex-col items-center justify-center p-4 bg-white rounded-3xl border border-border/50 hover:bg-blue-50 hover:border-blue-200 transition-all group scale-down-active">
                                                <Mail className="w-5 h-5 text-blue-500 mb-1 group-hover:scale-110 transition-transform" />
                                                <span className="text-[10px] font-black uppercase text-muted-foreground">Email</span>
                                            </a>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => router.push(`/leads?id=${selectedVisit.leadId}`)}
                                        className="w-full py-5 bg-[#7084FF] text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-[#7084FF]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
                                    >
                                        {t('calendar_view_profile')}
                                        <ExternalLink className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ) : selectedVisits.length > 0 ? (
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                <p className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-widest">{selectedVisits.length} {language === 'fr' ? 'Action(s) prevue(s)' : 'Planned action(s)'}</p>
                                {selectedVisits.map((visit) => (
                                    <button
                                        key={visit.id}
                                        onClick={() => setSelectedVisit(visit)}
                                        className="w-full p-5 bg-white rounded-[2rem] border border-border/30 hover:shadow-2xl hover:border-[#7084FF]/30 hover:-translate-y-1 transition-all text-left group flex items-center gap-4 active:scale-95"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center shrink-0 group-hover:bg-[#7084FF]/10 transition-colors">
                                            <User className="w-7 h-7 text-muted-foreground group-hover:text-[#7084FF] transition-colors" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-base font-black text-foreground truncate">{visit.leadName}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className={`w-2 h-2 rounded-full ${visit.status === 'confirmed' ? 'bg-green-500' : visit.status === 'missed' ? 'bg-red-500' : 'bg-orange-500'}`} />
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{visit.time} • AI {visit.aiScore}%</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
                                <div className="w-24 h-24 bg-secondary/30 rounded-full flex items-center justify-center mb-6">
                                    <CalendarIcon className="w-12 h-12 text-muted-foreground" />
                                </div>
                                <p className="text-lg font-black text-foreground">{t('calendar_no_visit_day')}</p>
                                <p className="text-sm font-medium text-muted-foreground mt-2">{language === 'fr' ? 'Planifiez vos visites pour voir les détails ici' : 'Schedule visits to see details here'}</p>
                            </div>
                        )}
                    </div>

                    {/* Fill the "holes" with stats/info as requested */}
                    <div className="glass p-8 rounded-[3rem] shadow-xl border border-white/40">
                        <h4 className="text-sm font-black text-foreground uppercase tracking-wider mb-6">{language === 'fr' ? 'Résumé de la Semaine' : 'Weekly Summary'}</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-3xl bg-green-500/10 border border-green-500/20 text-center">
                                <p className="text-2xl font-black text-green-600">{visits.filter(v => v.status === 'confirmed').length}</p>
                                <p className="text-[10px] font-bold text-green-700/60 uppercase">{language === 'fr' ? 'Confirmés' : 'Confirmed'}</p>
                            </div>
                            <div className="p-4 rounded-3xl bg-orange-500/10 border border-orange-500/20 text-center">
                                <p className="text-2xl font-black text-orange-600">{visits.filter(v => v.status === 'pending').length}</p>
                                <p className="text-[10px] font-bold text-orange-700/60 uppercase">En attente</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upcoming Visits List (Horizontal Scroll or Large Grid) */}
            <div className="glass p-10 rounded-[3rem] bg-gradient-to-br from-white/80 to-[#7084FF]/5 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-2xl font-black text-foreground">{t('calendar_upcoming_visits')} ({visits.length})</h3>
                    </div>
                    <button
                        onClick={() => router.push('/leads')}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-border rounded-xl font-black text-sm shadow-sm hover:shadow-md hover:bg-[#7084FF]/5 transition-all text-[#7084FF]"
                    >
                        {t('calendar_new_visit')}
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {visits.length > 0 ? visits.map((visit) => (
                        <div key={visit.id} className="p-6 bg-white rounded-[2.5rem] border border-border/40 hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150" />
                            <div className="flex items-center justify-between mb-4 relative">
                                <span className="text-xs font-black px-4 py-1.5 bg-[#7084FF] text-white rounded-xl shadow-lg shadow-[#7084FF]/20">
                                    {format(visit.date, 'dd MMM', { locale: language === 'fr' ? fr : undefined })}
                                </span>
                                <span className="text-xs font-black text-muted-foreground mr-2">{visit.time}</span>
                            </div>
                            <p className="text-lg font-black text-foreground mb-1 pr-6 group-hover:text-[#7084FF] transition-colors">{visit.leadName}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 truncate">{visit.property}</p>
                            <div className="mt-auto flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-primary/10 flex items-center justify-center text-[10px] font-black">{visit.aiScore}%</div>
                                </div>
                                <button onClick={() => setSelectedVisit(visit)} className="text-[10px] font-black text-[#7084FF] uppercase tracking-wider hover:underline">{language === 'fr' ? 'Détails' : 'Details'}</button>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full text-center py-12">
                            <CalendarIcon className="w-20 h-20 text-muted-foreground/20 mx-auto mb-4" />
                            <p className="text-lg font-black text-muted-foreground">{t('calendar_empty_state')}</p>
                            <p className="text-sm text-muted-foreground mt-1">{language === 'fr' ? 'Vos futurs rendez-vous s\'afficheront ici' : 'Your future appointments will appear here'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
