'use client'

import { ReactNode } from 'react'

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Link } from '@/i18n/navigation'

interface AdminHeaderProps {
    title: string
    description?: string
    breadcrumbs?: {
        label: string
        href?: string
    }[]
    actions?: ReactNode
}

export function AdminHeader({ title, description, breadcrumbs, actions }: AdminHeaderProps) {
    return (
        <div className='border-b bg-background'>
            <div className='mx-auto w-full max-w-[1600px] px-4 py-5 md:px-8 md:py-7'>
                {/* Breadcrumbs */}
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <Breadcrumb className='mb-4'>
                        <BreadcrumbList>
                            {breadcrumbs.map((crumb, idx) => (
                                <BreadcrumbItem key={`${crumb.label}-${idx}`}>
                                    {crumb.href ? (
                                        <BreadcrumbLink asChild>
                                            <Link href={crumb.href}>{crumb.label}</Link>
                                        </BreadcrumbLink>
                                    ) : (
                                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                    )}
                                    {idx < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                                </BreadcrumbItem>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                )}

                {/* Title and Actions */}
                <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                    <div>
                        <h1 className='text-xl font-semibold tracking-tight md:text-2xl'>{title}</h1>
                        {description && (
                            <p className='mt-1 text-sm text-muted-foreground md:text-base'>{description}</p>
                        )}
                    </div>

                    {/* Actions */}
                    {actions && <div className='flex w-full gap-2 md:w-auto'>{actions}</div>}
                </div>
            </div>
        </div>
    )
}
