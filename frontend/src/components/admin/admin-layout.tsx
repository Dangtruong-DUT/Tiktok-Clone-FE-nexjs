'use client'

import { ReactNode } from 'react'
import { AdminSidebar } from './admin-sidebar'
import { AdminTopbar } from './admin-topbar'

interface AdminLayoutProps {
    children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className='flex min-h-screen bg-muted/30 text-foreground'>
            {/* Sidebar */}
            <div className='hidden md:flex md:flex-col md:w-64 border-r bg-background'>
                <AdminSidebar />
            </div>

            {/* Main Content */}
            <div className='flex min-w-0 flex-1 flex-col'>
                <AdminTopbar />

                {/* Content Area */}
                <div className='flex-1 overflow-y-auto'>{children}</div>
            </div>
        </div>
    )
}
