import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Lead {
    id: string;
    name: string;
    income: number;
    contractType: 'CDI' | 'CDD' | 'Alternance' | 'Intérim' | 'Indépendant' | 'Stage' | string;
    hasGuarantor: boolean;
    entryDate: string;
    aiScore: number;
    status: 'new' | 'qualified' | 'visit' | 'applied' | 'signed';
    chatHistory: { role: 'user' | 'ai', message: string }[];
}

interface EliteStore {
    leads: Lead[];
    activeLead: string | null;
    addLead: (lead: Lead) => void;
    updateLead: (id: string, updates: Partial<Lead>) => void;
    deleteLead: (id: string) => void;
    setActiveLead: (id: string | null) => void;
    calculateScore: (lead: Partial<Lead>) => number;
}

export const useStore = create<EliteStore>()(
    persist(
        (set, get) => ({
            leads: [],
            activeLead: null,

            addLead: (lead) => set((state) => {
                if (state.leads.find(l => l.id === lead.id)) return state;
                return { leads: [lead, ...state.leads] };
            }),

            updateLead: (id, updates) => set((state) => ({
                leads: state.leads.map((l) =>
                    l.id === id ? { ...l, ...updates } : l
                )
            })),

            deleteLead: (id) => set((state) => ({
                leads: state.leads.filter((l) => l.id !== id)
            })),

            setActiveLead: (id) => set({ activeLead: id }),

            calculateScore: (lead) => {
                let score = 0;

                // 1. Revenu (40 pts max)
                if (lead.income && lead.income >= 3000) score += 40;
                else if (lead.income && lead.income >= 2000) score += 20;
                else if (lead.income && lead.income >= 1500) score += 10;

                // 2. Contrat (30 pts max) - SCORING INTELLIGENT
                const contractScores: Record<string, number> = {
                    'CDI': 30,           // 100% - Très stable
                    'Alternance': 15,    // 50% - Semi-stable
                    'CDD': 15,           // 50% - Semi-stable
                    'Indépendant': 15,   // 50% - Semi-stable
                    'Intérim': 15,       // 50% - Moins stable
                    'Stage': 15,         // 50% - Étudiant
                };

                if (lead.contractType) {
                    score += contractScores[lead.contractType] || 7.5; // Autre = 25% (7.5 pts)
                }

                // 3. Garant (20 pts)
                if (lead.hasGuarantor) score += 20;

                // 4. Complétude (10 pts)
                if (lead.name && lead.name !== 'Nouveau Prospect' && lead.name !== '') score += 5;
                if (lead.entryDate) score += 5;

                return Math.min(score, 100);
            }
        }),
        {
            name: 'elite-immo-storage',
            // Deduplicate leads on hydration
            onRehydrateStorage: () => (state) => {
                if (state?.leads) {
                    const uniqueLeads = Array.from(
                        new Map(state.leads.map(lead => [lead.id, lead])).values()
                    );
                    if (uniqueLeads.length !== state.leads.length) {
                        state.leads = uniqueLeads;
                    }
                }
            }
        }
    )
)
