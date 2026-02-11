import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export interface ChatMessage {
    role: 'user' | 'ai';
    message: string;
}

export interface Lead {
    id: string;
    name: string;
    income: number;
    contractType: 'CDI' | 'CDD' | 'Alternance' | 'Intérim' | 'Indépendant' | 'Stage' | string;
    hasGuarantor: boolean;
    entryDate: string;
    aiScore: number;
    status: 'new' | 'qualified' | 'visit' | 'applied' | 'signed';
    chatHistory: ChatMessage[];
}

interface EliteStore {
    leads: Lead[];
    activeLead: string | null;
    isLoading: boolean;
    fetchLeads: () => Promise<void>;
    addLead: (lead: Lead) => Promise<void>;
    updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
    deleteLead: (id: string) => Promise<void>;
    setActiveLead: (id: string | null) => void;
    calculateScore: (lead: Partial<Lead>) => number;
    syncChat: (leadId: string, message: ChatMessage) => Promise<void>;
}

export const useStore = create<EliteStore>((set, get) => ({
    leads: [],
    activeLead: null,
    isLoading: false,

    fetchLeads: async () => {
        set({ isLoading: true })
        try {
            const { data: leadsData, error: leadsError } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false })

            if (leadsError) {
                console.error('Supabase Error (leads):', leadsError)
                throw leadsError
            }

            // Fetch chat history for each lead
            const leadsWithChat = await Promise.all((leadsData || []).map(async (lead) => {
                const { data: messages, error: msgError } = await supabase
                    .from('chat_messages')
                    .select('role, message')
                    .eq('lead_id', lead.id)
                    .order('created_at', { ascending: true })

                if (msgError) console.error(`Error fetching chat for lead ${lead.id}:`, msgError)

                return {
                    id: lead.id,
                    name: lead.name,
                    income: lead.income,
                    contractType: lead.contract_type,
                    hasGuarantor: lead.has_guarantor,
                    entryDate: lead.entry_date,
                    aiScore: lead.ai_score,
                    status: lead.status,
                    chatHistory: messages || []
                } as Lead
            }))

            set({ leads: leadsWithChat })
        } catch (error: any) {
            console.error('Error fetching leads:', error)
            if (error.message?.includes('network')) {
                alert('Erreur réseau Supabase. Vérifiez votre connexion.')
            }
        } finally {
            set({ isLoading: false })
        }
    },

    addLead: async (lead) => {
        try {
            const { error } = await supabase.from('leads').insert([{
                id: lead.id,
                name: lead.name,
                income: lead.income,
                contract_type: lead.contractType,
                has_guarantor: lead.hasGuarantor,
                entry_date: lead.entryDate,
                ai_score: lead.aiScore,
                status: lead.status
            }])

            if (error) {
                console.error('Supabase Error (add):', error)
                alert(`Erreur Supabase lors de l'ajout: ${error.message}`)
                throw error
            }

            set((state) => ({ leads: [lead, ...state.leads] }))
        } catch (error) {
            console.error('Error adding lead:', error)
        }
    },

    updateLead: async (id, updates) => {
        try {
            const supabaseUpdates: any = {}
            if (updates.name !== undefined) supabaseUpdates.name = updates.name
            if (updates.income !== undefined) supabaseUpdates.income = updates.income
            if (updates.contractType !== undefined) supabaseUpdates.contract_type = updates.contractType
            if (updates.hasGuarantor !== undefined) supabaseUpdates.has_guarantor = updates.hasGuarantor
            if (updates.entryDate !== undefined) supabaseUpdates.entry_date = updates.entryDate
            if (updates.aiScore !== undefined) supabaseUpdates.ai_score = updates.aiScore
            if (updates.status !== undefined) supabaseUpdates.status = updates.status

            if (Object.keys(supabaseUpdates).length > 0) {
                const { error } = await supabase
                    .from('leads')
                    .update(supabaseUpdates)
                    .eq('id', id)
                if (error) {
                    console.error('Supabase Error (update):', error)
                    throw error
                }
            }

            set((state) => ({
                leads: state.leads.map((l) =>
                    l.id === id ? { ...l, ...updates } : l
                )
            }))
        } catch (error) {
            console.error('Error updating lead:', error)
        }
    },

    deleteLead: async (id) => {
        try {
            const { error } = await supabase.from('leads').delete().eq('id', id)
            if (error) {
                console.error('Supabase Error (delete):', error)
                throw error
            }
            set((state) => ({
                leads: state.leads.filter((l) => l.id !== id)
            }))
        } catch (error) {
            console.error('Error deleting lead:', error)
        }
    },

    syncChat: async (leadId, message) => {
        try {
            const { error } = await supabase.from('chat_messages').insert([{
                lead_id: leadId,
                role: message.role,
                message: message.message
            }])
            if (error) {
                console.error('Supabase Error (syncChat):', error)
                throw error
            }

            set((state) => ({
                leads: state.leads.map((l) =>
                    l.id === leadId ? { ...l, chatHistory: [...l.chatHistory, message] } : l
                )
            }))
        } catch (error) {
            console.error('Error syncing chat:', error)
        }
    },

    setActiveLead: (id) => set({ activeLead: id }),

    calculateScore: (lead) => {
        let score = 0;
        if (lead.income && lead.income >= 3000) score += 40;
        else if (lead.income && lead.income >= 2000) score += 20;
        else if (lead.income && lead.income >= 1500) score += 10;

        const contractScores: Record<string, number> = {
            'CDI': 30,
            'Alternance': 15,
            'CDD': 15,
            'Indépendant': 15,
            'Intérim': 15,
            'Stage': 15,
        };

        if (lead.contractType) {
            score += contractScores[lead.contractType] || 7.5;
        }

        if (lead.hasGuarantor) score += 20;
        if (lead.name && lead.name !== 'Nouveau Prospect' && lead.name !== '') score += 5;
        if (lead.entryDate) score += 5;

        return Math.min(score, 100);
    }
}))
