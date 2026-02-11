"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'fr' | 'en'

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
    fr: {
        // Navbar
        "nav_new_lead": "Nouveau Lead",
        "nav_search": "Rechercher...",
        "nav_notifications": "Notifications",
        "nav_notif_qualified": "Nouveau lead qualifié",
        "nav_notif_meeting": "Rendez-vous confirmé",
        "nav_notif_time_m": "Il y a {n} minutes",
        "nav_notif_time_h": "Il y a {n} heure",
        "nav_user_name": "Agent Elite",
        "nav_user_role": "Administrateur",
        "nav_notif_new": "Nouveau lead créé",

        // Sidebar
        "side_dashboard": "Tableau de Bord",
        "side_leads": "Prospects",
        "side_pipeline": "Tunnel de Ventes",
        "side_calendar": "Calendrier",
        "side_settings": "Paramètres",
        "side_reset": "Réinitialiser",
        side_share: "Partager Lien",
        side_link_copied: "Lien Copié !",
        side_link_desc: "Lien de candidature prêt à être envoyé.",
        "side_user_role": "Administrateur",

        // Dashboard
        "dash_title": "Tableau de Bord",
        "dash_welcome": "Bon retour, Agent Elite. Voici l'état de votre parc immobilier aujourd'hui.",
        "dash_recent_activities": "Activités Récentes",
        "dash_view_all": "Voir tout",
        "dash_type_visit": "Visite",
        "dash_type_sale": "Vente",
        "dash_type_rent": "Location",
        "dash_status_complete": "Terminé",
        "dash_status_pending": "En attente",
        "dash_status_processing": "En cours",
        "dash_notified": "Notifié",
        "dash_stats_prospects": "Prospects",
        "dash_stats_qualified": "Dossiers Qualifiés",
        "dash_stats_visits": "Rendez-vous",
        "dash_stats_sales": "Ventes",
        "dash_chart_title": "Croissance des Ventes",
        "dash_chart_subtitle": "Évolution mensuelle des ventes",
        "dash_chart_legend_sales": "Ventes",
        "dash_chart_legend_target": "Objectif",
        "dash_urgent_title": "Dossiers Urgents",
        "dash_urgent_empty": "Aucun dossier urgent pour le moment.",
        "dash_urgent_empty_sub": "Les leads avec un score ≥ 80% apparaîtront ici.",
        "dash_urgent_no_date": "Date non définie",
        "dash_urgent_action": "Action requise",

        // Leads Page
        leads_title: "Gestion des Leads",
        "leads_subtitle": "Qualifiez et gérez vos prospects avec l'assistance de l'IA.",
        "leads_search_placeholder": "Chercher un nom...",
        "leads_filter_all": "Afficher tout",
        "leads_filter_qualified": "Afficher uniquement les dossiers qualifiés",
        "leads_last_prospects": "Derniers prospects",
        "leads_no_message": "Aucun message",
        "leads_delete_confirm": "Supprimer ce prospect ?",

        // Kanban Page
        "kanban_title": "Pipeline des Ventes",
        "kanban_subtitle": "Suivez l'avancement de vos dossiers en temps réel.",
        "kanban_search": "Chercher...",
        "kanban_filters": "Filtres",
        "kanban_add": "Ajouter",
        kanban_stage_new: "Nouveau",
        kanban_stage_qualified: "Qualifié",
        kanban_stage_visit: "Visite",
        kanban_stage_applied: "Dossier",
        kanban_stage_signed: "Signé",
        kanban_empty: "Aucun lead ici",
        kanban_add_alert: "Ajouter un nouveau lead dans la catégorie : {title}",

        // Calendar Page
        "calendar_title": "Calendrier",
        "calendar_subtitle": "Gérez vos visites et rendez-vous avec vos prospects.",
        "calendar_select_date": "Sélectionnez une date",
        "calendar_no_visit_day": "Aucune visite prévue ce jour",
        "calendar_upcoming_visits": "Prochaines visites",
        "calendar_new_visit": "Nouvelle Visite",
        "calendar_empty_state": "Aucune visite planifiée. Créez un lead avec une date d'emménagement pour voir les rendez-vous ici.",
        "calendar_default_activity": "Visite d'emménagement",
        "calendar_actions_title": "Actions sur la visite de {name}",
        "calendar_visit_detail": "Détails de la visite",
        "calendar_ai_score": "Score IA",
        "calendar_call": "Appeler",
        "calendar_email": "Envoyer un email",
        "calendar_view_profile": "Voir le dossier",
        "calendar_status_confirmed": "Confirmé",
        "calendar_status_pending": "En attente",
        "calendar_status_missed": "Manqué",
        "calendar_missed_title": "Rendez-vous manqués",
        "calendar_recontact": "À relancer",

        // Chat
        chat_welcome: "Bonjour ! Je suis votre assistant Elite-Immo. Je vais vous aider à constituer votre dossier. Quel est votre nom complet ?",
        "chat_name_error": "Désolé, je n'ai pas bien saisi votre nom. Pourriez-vous le répéter ?",
        "chat_name_success": "Enchanté {name} ! C'est un plaisir de vous accompagner. Pour avancer, quel est votre revenu mensuel net moyen ?",
        "chat_income_error": "Désolé, je n'ai pas compris le montant. Pourriez-vous me l'indiquer en chiffres (ex: 2500) ?",
        "chat_income_success": "C'est noté : {income}€/mois. Quel est votre type de contrat de travail ? (CDI, CDD, Alternance...)",
        "chat_contract_error": "Je n'ai pas reconnu votre type de contrat. Est-ce un CDI, CDD, Alternance ou autre ?",
        chat_contract_success: "C'est noté. Possédez-vous un garant physique ou une garantie de type Visale ?",
        "chat_guarantor_error": "Je n'ai pas compris si vous aviez un garant. Répondez simplement par Oui ou par Non.",
        chat_guarantor_success: "Parfait. À partir de quelle date souhaiteriez-vous emménager ?",
        "chat_date_error": "Pourriez-vous préciser la date d'emménagement souhaitée ? (ex: le 1er mars)",
        "chat_complete": "Félicitations ! Votre dossier est maintenant complet et a été transmis à nos agents. Votre score de fiabilité est de {score}%.",
        "chat_complete_high": "C'est un excellent profil, nous allons le traiter en priorité !",
        chat_complete_low: "Nous reviendrons vers vous très prochainement.",
        chat_thinking: "L'IA réfléchit...",
        chat_other: "Autre situation",
        chat_other_placeholder: "Précisez votre contrat...",
        chat_back: "Retour au choix",
        chat_placeholder: "Écrivez votre réponse ici...",
        chat_edit_placeholder: "Modifiez votre réponse...",
        chat_yes: "Oui",
        chat_no: "Non",
        "chat_default": "Votre dossier est bien enregistré. Je reste à votre écoute si vous avez des questions.",
        chat_status_done: "Qualification terminée",
        chat_status_ongoing: "Qualification en cours",
        chat_extracted_data: "Données Extraites",
        chat_full_name: "Nom complet",
        chat_monthly_income: "Revenus mensuels",
        chat_contract_type: "Type de contrat",
        chat_guarantor: "Garant",
        chat_entry_date: "Date d'emménagement",
        chat_score_label: "Score IA",
        chat_ia_assist: "Assistance IA",
        chat_select_prospect: "Sélectionnez un prospect pour démarrer la qualification.",
        chat_generic_error: "Navré, je n'ai pas bien saisi. Pourriez-vous reformuler votre réponse ?",
        chat_guarantor_explain: "Un garant est une personne (souvent un proche) ou un organisme (comme Visale) qui s'engage à payer votre loyer si vous ne pouvez plus le faire. C'est une sécurité très appréciée des propriétaires. En avez-vous un ?",
        chat_name_demand: "J'ai besoin de votre nom pour créer votre dossier. Quel est-il ?",
        chat_name_nice: "Enchanté {name} ! C'est un plaisir de vous accompagner. Pour avancer, quel est votre revenu mensuel net moyen ?",
        chat_income_nice: "C'est noté : {income}€/mois. Quel est votre type de contrat de travail ? (CDI, CDD, Freelance...)",
        chat_contract_ask: "Très bien. Possédez-vous un garant physique ou une garantie de type Visale ?",
        chat_entry_ask: "Parfait. À partir de quelle date souhaiteriez-vous emménager ?",
        chat_dossier_title: "Candidature Locataire",
        chat_dossier_subtitle: "Votre dossier en 3 minutes",
        chat_dossier_footer: "Propulsé par Elite-Immo © 2026",
        chat_email_ask: "C'est noté. Pour que nos conseillers puissent vous recontacter, quelle est votre adresse email ?",
        chat_email_error: "L'adresse email ne semble pas valide. Pourriez-vous la corriger ?",
        chat_phone_ask: "Merci. Et enfin, quel est votre numéro de téléphone ?",
        chat_phone_error: "Le numéro de téléphone ne semble pas valide. Pourriez-vous le confirmer ?",
        chat_email: "Email",
        chat_phone: "Téléphone",

        // Common
        common_new: "Nouveau",

        // Settings
        settings_title: "Paramètres",
        settings_subtitle: "Gérez vos préférences et les réglages de votre compte.",
        settings_general: "Général",
        settings_username: "Nom d'utilisateur",
        settings_email: "Email",
        settings_notifications: "Notifications",
        settings_new_leads: "Nouveaux leads",
        settings_upcoming_visits: "Prochaines visites",
        settings_pipeline_updates: "Mises à jour du pipeline",
        settings_save: "Enregistrer les modifications",
        settings_admin_title: "Zone de Danger (Admin)",
        settings_reset_db: "Réinitialiser la base de données",
        settings_reset_confirm: "Êtes-vous sûr de vouloir supprimer TOUTES les données ? Cette action est irréversible.",
        settings_reset_success: "La base de données a été remise à zéro.",
    },
    en: {
        // Navbar
        "nav_new_lead": "New Lead",
        "nav_search": "Search...",
        "nav_notifications": "Notifications",
        "nav_notif_qualified": "New qualified lead",
        "nav_notif_meeting": "Meeting confirmed",
        "nav_notif_time_m": "{n} minutes ago",
        "nav_notif_time_h": "{n} hour ago",
        "nav_user_name": "Elite Agent",
        "nav_user_role": "Administrator",
        "nav_notif_new": "New lead created",

        // Sidebar
        "side_dashboard": "Dashboard",
        "side_leads": "Leads",
        "side_pipeline": "Pipeline",
        "side_calendar": "Calendar",
        "side_settings": "Settings",
        "side_reset": "Reset Database",
        side_share: "Share Link",
        side_link_copied: "Link Copied!",
        side_link_desc: "Application link ready to send.",
        "side_user_role": "Administrator",

        // Dashboard
        "dash_title": "Dashboard",
        "dash_welcome": "Welcome back, Elite Agent. Here is the status of your real estate portfolio today.",
        "dash_recent_activities": "Recent Activities",
        "dash_view_all": "View all",
        "dash_type_visit": "Visit",
        "dash_type_sale": "Sale",
        "dash_type_rent": "Rent",
        "dash_status_complete": "Complete",
        "dash_status_pending": "Pending",
        "dash_status_processing": "Processing",
        "dash_stats_prospects": "Prospects",
        "dash_stats_qualified": "Qualified Dossiers",
        "dash_stats_visits": "Appointments",
        "dash_stats_sales": "Sales",
        "dash_chart_title": "Sales Growth",
        "dash_chart_subtitle": "Monthly sales evolution",
        "dash_chart_legend_sales": "Sales",
        "dash_chart_legend_target": "Target",
        "dash_urgent_title": "Urgent Dossiers",
        "dash_urgent_empty": "No urgent dossiers at the moment.",
        "dash_urgent_empty_sub": "Leads with a score ≥ 80% will appear here.",
        "dash_urgent_no_date": "Date not defined",
        "dash_urgent_action": "Action required",

        // Leads Page
        "leads_title": "Leads Management",
        "leads_subtitle": "Qualify and manage your leads with AI assistance.",
        "leads_search_placeholder": "Search a name...",
        "leads_filter_all": "Show all",
        "leads_filter_qualified": "Show only qualified dossiers",
        "leads_last_prospects": "Latest prospects",
        "leads_no_message": "No message",
        "leads_delete_confirm": "Delete this prospect?",

        // Kanban Page
        "kanban_title": "Sales Pipeline",
        "kanban_subtitle": "Track your dossiers in real time.",
        "kanban_search": "Search...",
        "kanban_filters": "Filters",
        "kanban_add": "Add",
        kanban_stage_new: "New",
        kanban_stage_qualified: "Qualified",
        kanban_stage_visit: "Visit",
        kanban_stage_applied: "Applied",
        kanban_stage_signed: "Signed",
        kanban_empty: "No leads here",
        kanban_add_alert: "Add a new lead in category: {title}",

        // Calendar Page
        "calendar_title": "Calendar",
        "calendar_subtitle": "Manage your visits and meetings with prospects.",
        "calendar_select_date": "Select a date",
        "calendar_no_visit_day": "No visits planned today",
        "calendar_upcoming_visits": "Upcoming visits",
        "calendar_new_visit": "New Visit",
        "calendar_empty_state": "No visits planned. Create a lead with a move-in date to see appointments here.",
        "calendar_default_activity": "Move-in visit",
        "calendar_actions_title": "Actions on the visit of {name}",
        "calendar_visit_detail": "Visit Details",
        "calendar_ai_score": "AI Score",
        "calendar_call": "Call",
        "calendar_email": "Send Email",
        "calendar_view_profile": "View Profile",
        "calendar_status_confirmed": "Confirmed",
        "calendar_status_pending": "Pending",
        "calendar_status_missed": "Missed",
        "calendar_missed_title": "Missed Appointments",
        "calendar_recontact": "Follow Up",

        // Chat
        "chat_welcome": "Hello! I am Elite-Immo's AI assistant. I will help you qualify your rental application. To start, what is your full name?",
        "chat_name_error": "Sorry, I didn't quite catch your name. Could you repeat it?",
        "chat_name_success": "Nice to meet you {name}! It's a pleasure to assist you. To proceed, what are your average net monthly earnings?",
        "chat_income_error": "Sorry, I didn't understand the amount. Could you please indicate it in numbers (e.g., 2500)?",
        "chat_income_success": "Noted: {income}€/month. What is your current employment contract type? (CDI, CDD, Internship...)",
        "chat_contract_error": "I didn't recognize your contract type. Is it CDI, CDD, Internship or other?",
        "chat_contract_success": "Very well. Do you have a physical guarantor or a Visale-type guarantee?",
        "chat_guarantor_error": "I didn't understand if you have a guarantor. Please simply answer Yes or No.",
        "chat_guarantor_success": "Perfect. Last question: from which date would you like to move in?",
        "chat_date_error": "Could you please specify the desired move-in date? (e.g., March 1st)",
        "chat_complete": "Congratulations! Your application is now complete and has been forwarded to our agents. Your reliability score is {score}%.",
        "chat_complete_high": "This is an excellent profile, we will process it as a priority!",
        "chat_complete_normal": "We will get back to you very shortly.",
        "chat_thinking": "AI is thinking...",
        "chat_other": "✏️ Other (specify)",
        "chat_other_placeholder": "Describe your situation (e.g., Freelance, Self-employed...)",
        "chat_back": "← Back to options",
        "chat_placeholder": "Your answer...",
        "chat_edit_placeholder": "Edit your message...",
        "chat_yes": "✓ Yes",
        "chat_no": "✗ No",
        "chat_default": "Your application is well registered. I remain at your disposal if you have any questions.",
        chat_status_done: "Qualification complete",
        chat_status_ongoing: "Qualification in progress",
        chat_extracted_data: "Extracted Data",
        chat_full_name: "Full Name",
        chat_monthly_income: "Monthly Income",
        chat_contract_type: "Contract Type",
        chat_guarantor: "Guarantor",
        chat_entry_date: "Entry Date",
        chat_score_label: "AI Score",
        chat_ia_assist: "AI Assist",
        chat_select_prospect: "Select a prospect to start qualification.",
        chat_generic_error: "I'm sorry, I didn't quite catch that. Could you please rephrase your answer?",
        chat_guarantor_explain: "A guarantor is a person (often a relative) or an organization (like Visale) who commits to paying your rent if you can no longer do so. This is highly valued by landlords. Do you have one?",
        chat_name_demand: "I need your name to create your file. What is it?",
        chat_name_nice: "Nice to meet you {name}! It's a pleasure to assist you. To proceed, what is your average net monthly income?",
        chat_income_nice: "Noted: {income}€/month. What is your employment contract type? (Permanent, Fixed-term, Freelance...)",
        chat_contract_ask: "Very well. Do you have a physical guarantor or a Visale type guarantee?",
        chat_entry_ask: "Perfect. From what date would you like to move in?",
        chat_dossier_title: "Tenant Application",
        chat_dossier_subtitle: "Your file in 3 minutes",
        chat_dossier_footer: "Powered by Elite-Immo © 2026",
        chat_email_ask: "Noted. So our agents can reach you, what is your email address?",
        chat_email_error: "This email address doesn't seem valid. Could you please correct it?",
        chat_phone_ask: "Thank you. And finally, what is your phone number?",
        chat_phone_error: "This phone number doesn't seem valid. Could you please confirm it?",
        chat_email: "Email",
        chat_phone: "Phone",

        // Settings
        settings_title: "Settings",
        settings_subtitle: "Manage your preferences and account settings.",
        settings_general: "General",
        settings_username: "Username",
        settings_email: "Email",
        settings_notifications: "Notifications",
        settings_new_leads: "New leads",
        settings_upcoming_visits: "Upcoming visits",
        settings_pipeline_updates: "Pipeline updates",
        settings_save: "Save changes",
        settings_admin_title: "Danger Zone (Admin)",
        settings_reset_db: "Reset Database",
        settings_reset_confirm: "Are you sure you want to delete ALL data? This action is irreversible.",
        settings_reset_success: "Database has been reset successfully.",

        // Common
        common_new: "New",
    }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('fr')

    const t = (key: string) => {
        return translations[language][key] || key
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
