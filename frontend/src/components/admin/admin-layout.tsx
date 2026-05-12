'use client'

import { ReactNode, useState } from 'react'
import { AdminSidebar } from './admin-sidebar'
import { AdminTopbar } from './admin-topbar'

export interface BreadcrumbEntry {
    label: string
    href?: string
}

interface AdminLayoutProps {
    children: ReactNode
    title?: string
    description?: string
    breadcrumbs?: BreadcrumbEntry[]
    actions?: ReactNode
}

export function AdminLayout({ children, title, description, breadcrumbs, actions }: AdminLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    return (
        <div className='flex h-screen bg-muted/20 text-foreground overflow-hidden'>
            <AdminSidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed((v) => !v)}
            />

            <div className='flex min-w-0 flex-1 flex-col min-h-0'>
                <AdminTopbar
                    title={title}
                    description={description}
                    breadcrumbs={breadcrumbs}
                    actions={actions}
                    onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
                />
                <main className='flex-1 overflow-y-auto'>{children}</main>
            </div>
        </div>
    )
}
