"use client"

import React from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { MobileSidebar } from './MobileSidebar'
import { Navbar } from './Navbar'
import { cn } from '../../lib/utils'
import { LanguageSelector } from './LanguageSelector'

export function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isStandalone = pathname === '/candidature'

    if (isStandalone) {
        return (
            <main className="min-h-screen w-full relative">
                <LanguageSelector className="fixed top-4 right-4 z-[100]" />
                {children}
            </main>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] relative">

            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            {/* Mobile Sidebar Trigger & Overlay */}
            <div className="md:hidden">
                <MobileSidebar />
            </div>

            {/* Main Content Area */}
            <div className={cn(
                "transition-all duration-300",
                "md:pl-64" // Offset for sidebar on desktop
            )}>
                <Navbar />
                <main className="pt-20 min-h-screen px-4 md:px-8 pb-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
