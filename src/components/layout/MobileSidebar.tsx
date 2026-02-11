"use client"

import React, { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Sidebar } from './Sidebar'

export function MobileSidebar() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Hamburger Button - Only visible on mobile */}
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg flex items-center justify-center border border-border/50 hover:bg-white transition-all"
                aria-label="Open menu"
            >
                <Menu className="w-6 h-6 text-primary" />
            </button>

            {/* Overlay + Sidebar */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] md:hidden">
                    {/* Dark overlay */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Sidebar */}
                    <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] animate-in slide-in-from-left duration-300">
                        <Sidebar />

                        {/* Close button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all"
                            aria-label="Close menu"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
