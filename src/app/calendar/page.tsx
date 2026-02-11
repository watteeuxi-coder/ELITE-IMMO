"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, parse } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar as CalendarIcon, Clock, MapPin, User, MoreHorizontal, Phone, Mail, ExternalLink, AlertCircle } from 'lucide-react'
import 'react-day-picker/dist/style.css'
import { useStore, Lead } from '../../store/useStore'

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
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
    const [selectedVisit, setSelectedVisit] = useState<Visit | undefined>()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

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
                    // Try natural language like "27 février" or "le 1er mars"
                    else {
                        // Default to today + 7 days for unparseable dates
                        parsedDate = new Date()
                        parsedDate.setDate(parsedDate.getDate() + 7)
                    }
                } catch {
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

    const visitDates = visits.map(v => v.date)
    const confirmedVisitDates = visits.filter(v => v.status === 'confirmed').map(v => v.date)
    const pendingVisitDates = visits.filter(v => v.status === 'pending').map(v => v.date)
    const missedVisitDates = visits.filter(v => v.status === 'missed').map(v => v.date)
    const missedVisits = visits.filter(v => v.status === 'missed')

    const selectedVisits = visits.filter(v =>
        selectedDate && format(v.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">{t('calendar_title')}</h1>
                <p className="text-muted-foreground font-medium">{t('calendar_subtitle')}</p>
            </div>

            {/* Missed Appointments Alert */}
            {missedVisits.length > 0 && (
                <div className="glass p-6 rounded-3xl border-2 border-red-200 bg-red-50/50">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-red-900 mb-2">{t('calendar_missed_title')}</h3>
                            <p className="text-sm text-red-700 mb-4">{missedVisits.length} rendez-vous manqué(s) à relancer</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {missedVisits.slice(0, 4).map((visit) => (
                                    <button
                                        key={visit.id}
                                        onClick={() => {
                                            setSelectedDate(visit.date)
                                            setSelectedVisit(visit)
                                        }}
                                        className="p-3 bg-white rounded-xl border border-red-200 hover:border-red-400 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                                <User className="w-4 h-4 text-red-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-foreground truncate">{visit.leadName}</p>
                                                <p className="text-xs text-muted-foreground">{format(visit.date, 'dd MMM', { locale: language === 'fr' ? fr : undefined })}</p>
                                            </div>
                                            <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-md">
                                                {t('calendar_recontact')}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-2 glass p-8 rounded-3xl">
                    <style jsx global>{`
            .rdp {
              --rdp-cell-size: 50px;
              --rdp-accent-color: #7084FF;
              --rdp-background-color: rgba(112, 132, 255, 0.1);
              font-family: inherit;
            }
            .rdp-months {
              justify-content: center;
            }
            .rdp-caption {
              margin-bottom: 1.5rem;
            }
            .rdp-caption_label {
              font-size: 1.125rem;
              font-weight: 700;
              color: #1a1a1a;
            }
            .rdp-head_cell {
              font-weight: 600;
              font-size: 0.875rem;
              color: #636366;
              text-transform: uppercase;
            }
            .rdp-cell {
              padding: 0.25rem;
            }
            .rdp-day {
              border-radius: 12px;
              font-weight: 500;
              transition: all 0.2s;
            }
            .rdp-day:hover:not(.rdp-day_selected) {
              background-color: rgba(112, 132, 255, 0.1);
            }
            .rdp-day_selected {
              background-color: #7084FF;
              color: white;
              font-weight: 700;
            }
            .rdp-day_today {
              font-weight: 700;
              color: #7084FF;
            }
            .visit-indicator {
              position: relative;
            }
            .visit-indicator::after {
              content: '';
              position: absolute;
              bottom: 4px;
              left: 50%;
              transform: translateX(-50%);
              width: 6px;
              height: 6px;
              background-color: #7084FF;
              border-radius: 50%;
            }
            .visit-confirmed {
              position: relative;
            }
            .visit-confirmed::after {
              content: '';
              position: absolute;
              bottom: 4px;
              left: 50%;
              transform: translateX(-50%);
              width: 6px;
              height: 6px;
              background-color: #16a34a;
              border-radius: 50%;
            }
            .visit-pending {
              position: relative;
            }
            .visit-pending::after {
              content: '';
              position: absolute;
              bottom: 4px;
              left: 50%;
              transform: translateX(-50%);
              width: 6px;
              height: 6px;
              background-color: #f59e0b;
              border-radius: 50%;
            }
            .visit-missed {
              position: relative;
            }
            .visit-missed::after {
              content: '';
              position: absolute;
              bottom: 4px;
              left: 50%;
              transform: translateX(-50%);
              width: 6px;
              height: 6px;
              background-color: #dc2626;
              border-radius: 50%;
              animation: pulse 2s infinite;
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
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
                            visit: 'visit-indicator',
                            visitConfirmed: 'visit-confirmed',
                            visitPending: 'visit-pending',
                            visitMissed: 'visit-missed'
                        }}
                    />
                </div>

                {/* Visit Details Panel */}
                <div className="glass p-6 rounded-3xl">
                    <div className="flex items-center gap-2 mb-6">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-bold text-foreground">
                            {selectedDate ? format(selectedDate, language === 'fr' ? 'dd MMMM yyyy' : 'MMMM dd, yyyy', { locale: language === 'fr' ? fr : undefined }) : t('calendar_select_date')}
                        </h3>
                    </div>

                    {selectedVisit ? (
                        <div className="space-y-4">
                            {/* Lead Avatar & Name */}
                            <div className="flex items-center gap-4 pb-4 border-b border-border">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <User className="w-8 h-8 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xl font-bold text-foreground">{selectedVisit.leadName}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">{selectedVisit.time}</span>
                                    </div>
                                </div>
                            </div>

                            {/* AI Score Badge */}
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-2xl">
                                <span className="font-semibold text-foreground">{t('calendar_ai_score')}</span>
                                <span className={`text-2xl font-black ${selectedVisit.aiScore >= 80 ? 'text-green-600' :
                                    selectedVisit.aiScore >= 60 ? 'text-orange-600' :
                                        'text-red-600'
                                    }`}>
                                    {selectedVisit.aiScore}%
                                </span>
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">Statut:</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedVisit.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                    selectedVisit.status === 'missed' ? 'bg-red-100 text-red-700' :
                                        'bg-orange-100 text-orange-700'
                                    }`}>
                                    {t(`calendar_status_${selectedVisit.status}`)}
                                </span>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-3 pt-4 border-t border-border">
                                {selectedVisit.phone && (
                                    <a
                                        href={`tel:${selectedVisit.phone}`}
                                        className="flex items-center gap-3 p-3 bg-white/80 rounded-xl hover:bg-white transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Phone className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground">{t('calendar_call')}</p>
                                            <p className="font-semibold text-foreground">{selectedVisit.phone}</p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                    </a>
                                )}
                                {selectedVisit.email && (
                                    <a
                                        href={`mailto:${selectedVisit.email}`}
                                        className="flex items-center gap-3 p-3 bg-white/80 rounded-xl hover:bg-white transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Mail className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground">{t('calendar_email')}</p>
                                            <p className="font-semibold text-foreground text-sm truncate">{selectedVisit.email}</p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                    </a>
                                )}
                            </div>

                            {/* View Profile Button */}
                            <a
                                href={`/leads`}
                                className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                {t('calendar_view_profile')}
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    ) : selectedVisits.length > 0 ? (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground mb-3">{selectedVisits.length} visite(s) ce jour</p>
                            {selectedVisits.map((visit) => (
                                <button
                                    key={visit.id}
                                    onClick={() => setSelectedVisit(visit)}
                                    className="w-full p-4 bg-white/80 rounded-2xl border border-border/50 hover:bg-white hover:border-primary/30 transition-all text-left"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <User className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-foreground mb-1">{visit.leadName}</p>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{visit.time}</span>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${visit.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                            visit.status === 'missed' ? 'bg-red-100 text-red-700' :
                                                'bg-orange-100 text-orange-700'
                                            }`}>
                                            {visit.aiScore}%
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <CalendarIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">{t('calendar_no_visit_day')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Upcoming Visits */}
            <div className="glass p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-foreground">{t('calendar_upcoming_visits')} ({visits.length})</h3>
                    <button
                        onClick={() => alert("Créez un nouveau lead via la page Leads pour planifier une visite")}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <span className="text-lg">+</span>
                        <span>{t('calendar_new_visit')}</span>
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visits.length > 0 ? visits.map((visit) => (
                        <div key={visit.id} className="p-4 bg-white/50 rounded-2xl border border-white/40 hover:bg-white transition-all group flex flex-col relative">
                            <button
                                onClick={() => alert(t('calendar_actions_title').replace('{name}', visit.leadName))}
                                className="absolute top-4 right-4 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary rounded-lg"
                            >
                                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold px-2.5 py-1 bg-primary/10 text-primary rounded-lg">
                                    {format(visit.date, 'dd MMM', { locale: language === 'fr' ? fr : undefined })}
                                </span>
                                <span className="text-xs font-bold text-muted-foreground pr-6">{visit.time}</span>
                            </div>
                            <p className="text-sm font-bold text-foreground mb-1">{visit.leadName}</p>
                            <p className="text-xs text-muted-foreground truncate">{visit.property}</p>
                        </div>
                    )) : (
                        <div className="col-span-full text-center py-8">
                            <CalendarIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">{t('calendar_empty_state')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
