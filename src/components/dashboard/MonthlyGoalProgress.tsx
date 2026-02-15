import React from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { useStore } from '../../store/useStore'
import { TrendingUp } from 'lucide-react'

export const MonthlyGoalProgress: React.FC = () => {
    const { t, language } = useLanguage()
    const { leads } = useStore()

    const thisMonth = new Date()
    const assignedThisMonth = leads.filter(l => {
        if (l.status !== 'assigned' || !l.entryDate) return false
        const entryDate = new Date(l.entryDate)
        return entryDate.getMonth() === thisMonth.getMonth() &&
            entryDate.getFullYear() === thisMonth.getFullYear()
    }).length

    const monthlyGoal = 15
    const progress = Math.min((assignedThisMonth / monthlyGoal) * 100, 100)
    const goalMet = assignedThisMonth >= monthlyGoal

    return (
        <div className="glass p-6 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-2xl ${goalMet ? 'bg-green-500/10' : 'bg-orange-500/10'}`}>
                    <TrendingUp className={`w-6 h-6 ${goalMet ? 'text-green-500' : 'text-orange-500'}`} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-foreground">
                        {language === 'fr' ? 'Objectif Mensuel' : 'Monthly Goal'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {language === 'fr' ? 'Dossiers assignés ce mois' : 'Files assigned this month'}
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-foreground">
                        {assignedThisMonth}/{monthlyGoal}
                    </span>
                    <span className={`text-sm font-bold px-3 py-1 rounded-xl ${goalMet ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {Math.round(progress)}%
                    </span>
                </div>

                <div className="h-3 bg-secondary/30 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-700 ${goalMet ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-orange-400 to-orange-600'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {goalMet && (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-bold">
                        <span className="text-lg">🎉</span>
                        {language === 'fr' ? 'Objectif atteint !' : 'Goal achieved!'}
                    </div>
                )}
            </div>
        </div>
    )
}
