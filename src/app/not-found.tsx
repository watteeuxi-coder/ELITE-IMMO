import React from 'react'
import Link from 'next/link'
import { Home } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 text-center">
            <div className="space-y-2">
                <h1 className="text-9xl font-black text-primary/20">404</h1>
                <h2 className="text-3xl font-bold text-foreground">Page Introuvable</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
                </p>
            </div>

            <Link
                href="/"
                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
                <Home className="w-5 h-5" />
                Retour à l'accueil
            </Link>
        </div>
    )
}
