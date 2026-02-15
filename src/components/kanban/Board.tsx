"use client"

import { Column } from './Column'
import { useStore, Lead } from '../../store/useStore'
import { useLanguage } from '../../i18n/LanguageContext'
import { useState, useEffect } from 'react'
import { Toast } from '../common/Toast'

import {
    DndContext,
    DragEndEvent,
    TouchSensor,
    MouseSensor,
    useSensor,
    useSensors,
    closestCenter,
} from '@dnd-kit/core'

export function KanbanBoard() {
    const { leads, updateLead, archiveLead } = useStore()
    const { t, language } = useLanguage()
    const [toastLead, setToastLead] = useState<Lead | null>(null)
    const [prevLeadsStatus, setPrevLeadsStatus] = useState<Map<string, Lead['status']>>(new Map())

    const STAGES: { title: string, status: Lead['status'] }[] = [
        { title: t('kanban_stage_new'), status: 'new' },
        { title: t('kanban_stage_qualified'), status: 'qualified' },
        { title: t('kanban_stage_visit'), status: 'visit' },
        { title: t('kanban_stage_applied'), status: 'applied' },
        { title: t('kanban_stage_signed'), status: 'signed' },
    ]

    // Detect when a lead moves to 'signed' status
    useEffect(() => {
        leads.forEach(lead => {
            const prevStatus = prevLeadsStatus.get(lead.id)
            if (prevStatus !== 'signed' && lead.status === 'signed' && !lead.isArchived) {
                setToastLead(lead)
            }
        })
        // Update the previous status map
        const newMap = new Map<string, Lead['status']>()
        leads.forEach(lead => newMap.set(lead.id, lead.status))
        setPrevLeadsStatus(newMap)
    }, [leads, prevLeadsStatus])
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        // If dropped over a column (status)
        if (STAGES.some(s => s.status === overId)) {
            updateLead(activeId, { status: overId as Lead['status'] })
            return
        }

        // If dropped over another card
        const overLead = leads.find((l: Lead) => l.id === overId)
        if (overLead && overLead.status !== leads.find((l: Lead) => l.id === activeId)?.status) {
            updateLead(activeId, { status: overLead.status })
        }
    }

    const handleArchive = async () => {
        if (toastLead) {
            await archiveLead(toastLead.id)
            setToastLead(null)
        }
    }

    // Filter out archived leads
    const activeLeads = leads.filter((l: Lead) => !l.isArchived)

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-8 h-full scrollbar-hide snap-x md:snap-none">
                {STAGES.map((stage) => (
                    <div key={stage.status} className="snap-center shrink-0">
                        <Column
                            title={stage.title}
                            status={stage.status}
                            leads={activeLeads
                                .filter((l: Lead) => l.status === stage.status)
                                .sort((a: Lead, b: Lead) => (b.aiScore || 0) - (a.aiScore || 0))
                            }
                        />
                    </div>
                ))}
            </div>
            {toastLead && (
                <Toast
                    message={language === 'fr'
                        ? `${toastLead.name} est maintenant en statut Signé !`
                        : `${toastLead.name} is now marked as Signed!`
                    }
                    action={{
                        label: language === 'fr' ? 'Clôturer le dossier' : 'Close Case',
                        onClick: handleArchive
                    }}
                    onClose={() => setToastLead(null)}
                />
            )}
        </DndContext>
    )
}
