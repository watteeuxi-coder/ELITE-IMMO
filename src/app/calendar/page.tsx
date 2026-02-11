"use client"

import React, { useState, useMemo } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, parse } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar as CalendarIcon, Clock, MapPin, User, MoreHorizontal } from 'lucide-react'
import 'react-day-picker/dist/style.css'
import { useStore, Lead } from '../../store/useStore'

interface Visit {
    id: string
    leadName: string
    property: string
    time: string
    date: Date
    leadId: string
}

import { useLanguage } from '../../i18n/LanguageContext'

export default function CalendarPage() {
    const { leads } = useStore()
    const { t, language } = useLanguage()
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

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

                return {
                    id: lead.id,
                    leadId: lead.id,
                    leadName: lead.name || 'Prospect',
                    property: t('calendar_default_activity'),
                    time: '10:00', // Default time
                    date: parsedDate
                }
            })
    }, [leads, t])

    const visitDates = visits.map(v => v.date)
    const selectedVisits = visits.filter(v =>
        selectedDate && format(v.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">{t('calendar_title')}</h1>
                <p className="text-muted-foreground font-medium">{t('calendar_subtitle')}</p>
            </div>

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
          `}</style>

                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        locale={language === 'fr' ? fr : undefined}
                        modifiers={{
                            visit: visitDates
                        }}
                        modifiersClassNames={{
                            visit: 'visit-indicator'
                        }}
                    />
                </div>

                {/* Visits List */}
                <div className="glass p-6 rounded-3xl">
                    <div className="flex items-center gap-2 mb-6">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-bold text-foreground">
                            {selectedDate ? format(selectedDate, language === 'fr' ? 'dd MMMM yyyy' : 'MMMM dd, yyyy', { locale: language === 'fr' ? fr : undefined }) : t('calendar_select_date')}
                        </h3>
                    </div>

                    {selectedVisits.length > 0 ? (
                        <div className="space-y-4">
                            {selectedVisits.map((visit) => (
                                <div key={visit.id} className="p-4 bg-white/80 rounded-2xl border border-border/50 hover:bg-white transition-all">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <User className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-foreground mb-1">{visit.leadName}</p>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                                                <MapPin className="w-3 h-3" />
                                                <span className="truncate">{visit.property}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                <span>{visit.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
