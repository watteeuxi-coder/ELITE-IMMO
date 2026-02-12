"use client"

import React from 'react'
import { Column } from './Column'
import { useStore, Lead } from '../../store/useStore'
import { useLanguage } from '../../i18n/LanguageContext'

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
    const { leads, updateLead } = useStore()
    const { t } = useLanguage()

    const STAGES: { title: string, status: Lead['status'] }[] = [
        { title: t('kanban_stage_new'), status: 'new' },
        { title: t('kanban_stage_qualified'), status: 'qualified' },
        { title: t('kanban_stage_visit'), status: 'visit' },
        { title: t('kanban_stage_applied'), status: 'applied' },
        { title: t('kanban_stage_signed'), status: 'signed' },
    ]
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
                            leads={leads
                                .filter((l: Lead) => l.status === stage.status)
                                .sort((a: Lead, b: Lead) => (b.aiScore || 0) - (a.aiScore || 0))
                            }
                        />
                    </div>
                ))}
            </div>
        </DndContext>
    )
}
