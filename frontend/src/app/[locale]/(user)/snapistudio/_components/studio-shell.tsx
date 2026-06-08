'use client'

import { useState } from 'react'
import NavLinks from './nav-links'
import Header from './header'
import { AiCopilot } from '@/components/ai-copilot/AiCopilot'

export function StudioShell({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false)
    const toggle = () => setCollapsed((v) => !v)

    return (
        <div className='flex h-screen bg-muted/20 overflow-hidden'>
            <NavLinks collapsed={collapsed} onToggle={toggle} />
            <div className='flex-1 flex flex-col min-w-0 overflow-hidden'>
                <Header onToggleSidebar={toggle} />
                <main className='flex-1 overflow-auto scrollbar-hidden'>{children}</main>
            </div>
            <AiCopilot />
        </div>
    )
}
