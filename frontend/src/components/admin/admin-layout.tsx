'use client'

import { ReactNode } from 'react'
import { AdminSidebar } from './admin-sidebar'

interface AdminLayoutProps {
    children: ReactNode
}

/**
 * AdminLayout - Main layout wrapper for admin pages
 * Contains: Sidebar navigation + Main content area
 */
export function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className='flex h-screen bg-background'>
            {/* Sidebar */}
            <div className='hidden md:flex md:flex-col md:w-64 border-r'>
                <AdminSidebar />
            </div>

            {/* Main Content */}
            <div className='flex-1 flex flex-col overflow-hidden'>
                {/* Mobile Header */}
                <div className='md:hidden flex items-center justify-between p-4 border-b'>
                    <h1 className='text-lg font-semibold'>Admin</h1>
                </div>

                {/* Content Area */}
                <div className='flex-1 overflow-auto'>{children}</div>
            </div>
        </div>
    )
}
