'use client'

import { ReactNode } from 'react'
import { AdminSidebar } from './admin-sidebar'
import { AdminTopbar } from './admin-topbar'

interface AdminLayoutProps {
    children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className='flex h-screen bg-muted/30 text-foreground overflow-hidden'>
            {/* Sidebar */}
            <div className='hidden md:flex md:flex-col md:w-64 border-r bg-background shrink-0'>
                <AdminSidebar />
            </div>

            {/* Main Content */}
            <div className='flex min-w-0 flex-1 flex-col min-h-0'>
                <AdminTopbar />

                {/* Content Area */}
                <main className='flex-1 overflow-y-auto min-h-0'>{children}</main>
            </div>
        </div>
    )
}
