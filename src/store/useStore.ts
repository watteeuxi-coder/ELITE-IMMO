import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export interface ChatMessage {
    role: 'user' | 'ai';
    message: string;
}

export interface Lead {
    id: string;
    name: string;
    income?: number;
    contractType?: 'CDI' | 'CDD' | 'Alternance' | 'Intérim' | 'Indépendant' | 'Stage' | string;
    hasGuarantor?: boolean;
    entryDate?: string;
    email?: string;
    phone?: string;
    aiScore: number;
    status: 'new' | 'qualified' | 'visit' | 'applied' | 'signed';
    chatHistory: ChatMessage[];
}

export interface EliteNotification {
    id: string;
    created_at: string;
    lead_id: string;
    type: 'new_lead' | 'qualified' | 'visit';
    message_key: string;
    is_read: boolean;
}

export interface UserProfile {
    name: string;
    email: string;
    role: string;
    avatar?: string;
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
    replaceChatHistory: (leadId: string, history: ChatMessage[]) => Promise<void>;
    resetDatabase: () => Promise<void>;
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;

    // Notifications
    notifications: EliteNotification[];
    fetchNotifications: () => Promise<void>;
    addNotification: (notification: Omit<EliteNotification, 'id' | 'created_at' | 'is_read'>) => Promise<void>;
    markAllNotificationsAsRead: () => Promise<void>;
    subscribeToNotifications: () => void;

    // User Profile
    userProfile: UserProfile;
    updateProfile: (profile: Partial<UserProfile>) => void;
}

export const useStore = create<EliteStore>((set, get) => ({
    leads: [],
    notifications: [],
    activeLead: null,
    isLoading: false,
    isSidebarOpen: false,
    userProfile: {
        name: 'Agent Elite',
        email: 'agent@elite-immo.fr',
        role: 'Consultant Senior'
    },
    updateProfile: (profile) => set((state) => ({
        userProfile: { ...state.userProfile, ...profile }
    })),
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setSidebarOpen: (open) => set({ isSidebarOpen: open }),

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
                    email: lead.email,
                    phone: lead.phone,
                    aiScore: lead.ai_score,
                    status: lead.status,
                    chatHistory: messages || []
                } as Lead
            }))

            set({ leads: leadsWithChat })

            // Also fetch notifications
            const { data: notifData, error: notifError } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20)

            if (notifError) console.error('Supabase Error (notifications):', notifError)
            else set({ notifications: notifData || [] })

        } catch (error: unknown) {
            console.error('Error fetching leads:', error)
            const err = error as { message?: string }
            if (err.message?.includes('network')) {
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
                email: lead.email,
                phone: lead.phone,
                ai_score: lead.aiScore,
                status: lead.status
            }])

            if (error) {
                console.error('Supabase Error (add):', error)
                alert(`Erreur Supabase lors de l'ajout: ${error.message}`)
                throw error
            }

            set((state) => ({ leads: [lead, ...state.leads] }))

            // Add notification for new lead
            await get().addNotification({
                lead_id: lead.id,
                type: 'new_lead',
                message_key: 'nav_notif_new'
            })
        } catch (error) {
            console.error('Error adding lead:', error)
        }
    },

    updateLead: async (id, updates) => {
        try {
            const supabaseUpdates: Record<string, string | number | boolean | null> = {}
            if (updates.name !== undefined) supabaseUpdates.name = updates.name
            if (updates.income !== undefined) supabaseUpdates.income = updates.income
            if (updates.contractType !== undefined) supabaseUpdates.contract_type = updates.contractType
            if (updates.hasGuarantor !== undefined) supabaseUpdates.has_guarantor = updates.hasGuarantor
            if (updates.entryDate !== undefined) supabaseUpdates.entry_date = updates.entryDate
            if (updates.email !== undefined) supabaseUpdates.email = updates.email
            if (updates.phone !== undefined) supabaseUpdates.phone = updates.phone
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

        if (lead.hasGuarantor !== undefined && lead.hasGuarantor === true) score += 20;
        if (lead.name && lead.name !== 'Nouveau Prospect' && lead.name !== '') score += 5;
        if (lead.entryDate) score += 5;

        return Math.min(score, 100);
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

    replaceChatHistory: async (leadId, history) => {
        try {
            // Delete all current messages for this lead
            await supabase.from('chat_messages').delete().eq('lead_id', leadId)

            // Re-insert the new history
            if (history.length > 0) {
                const { error } = await supabase.from('chat_messages').insert(
                    history.map(msg => ({
                        lead_id: leadId,
                        role: msg.role,
                        message: msg.message
                    }))
                )
                if (error) throw error
            }

            set((state) => ({
                leads: state.leads.map((l) =>
                    l.id === leadId ? { ...l, chatHistory: history } : l
                )
            }))
        } catch (error) {
            console.error('Error replacing chat history:', error)
        }
    },

    resetDatabase: async () => {
        set({ isLoading: true })
        try {
            // Delete all messages first (to avoid FK constraints if they exist)
            const { error: msgError } = await supabase
                .from('chat_messages')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000') // Hack to delete all: delete where id is not an impossible UUID

            if (msgError) console.error('Error deleting messages:', msgError)

            // Delete all leads
            const { error: leadsError } = await supabase
                .from('leads')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000')

            if (leadsError) {
                console.error('Error deleting leads:', leadsError)
                throw leadsError
            }

            set({ leads: [], activeLead: null })
            alert('Base de données réinitialisée avec succès !')
        } catch (error: unknown) {
            console.error('Reset error:', error)
            const err = error as { message?: string }
            alert(`Erreur lors de la réinitialisation: ${err.message}`)
        } finally {
            set({ isLoading: false })
        }
    },

    fetchNotifications: async () => {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20)

        if (!error) set({ notifications: data || [] })

        // Auto-subscribe
        get().subscribeToNotifications()
    },

    subscribeToNotifications: () => {
        supabase
            .channel('realtime_notifications')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'notifications'
            }, () => {
                get().fetchNotifications()
            })
            .subscribe()
    },

    addNotification: async (notif) => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .insert([notif])
                .select()

            if (error) {
                console.error('Supabase Error (addNotification):', error)
                return
            }

            if (data && data.length > 0) {
                set((state) => ({ notifications: [data[0], ...state.notifications] }))
            }
        } catch (error) {
            console.error('Error adding notification:', error)
        }
    },

    markAllNotificationsAsRead: async () => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('is_read', false)

        if (!error) {
            set((state) => ({
                notifications: state.notifications.map(n => ({ ...n, is_read: true }))
            }))
        }
    }
}))
