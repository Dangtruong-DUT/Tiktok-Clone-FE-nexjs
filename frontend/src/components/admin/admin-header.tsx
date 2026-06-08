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
import { cn } from '@/lib/utils'

interface BreadcrumbEntry {
    label: string
    href?: string
}

interface AdminHeaderProps {
    title: string
    description?: string
    breadcrumbs?: BreadcrumbEntry[]
    actions?: ReactNode
    className?: string
}

export function AdminHeader({ title, description, breadcrumbs, actions, className }: AdminHeaderProps) {
    return (
        <div className={cn('border-b bg-background px-4 md:px-6 py-4', className)}>
            {breadcrumbs && breadcrumbs.length > 0 && (
                <Breadcrumb className='mb-2'>
                    <BreadcrumbList>
                        {breadcrumbs.map((crumb, idx) => (
                            <BreadcrumbItem key={`${crumb.label}-${idx}`}>
                                {crumb.href ? (
                                    <BreadcrumbLink asChild>
                                        <Link href={crumb.href} className='text-xs'>
                                            {crumb.label}
                                        </Link>
                                    </BreadcrumbLink>
                                ) : (
                                    <BreadcrumbPage className='text-xs'>{crumb.label}</BreadcrumbPage>
                                )}
                                {idx < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                            </BreadcrumbItem>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            )}

            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='min-w-0'>
                    <h1 className='text-lg font-semibold tracking-tight sm:text-xl'>{title}</h1>
                    {description && <p className='mt-0.5 text-sm text-muted-foreground truncate'>{description}</p>}
                </div>
                {actions && <div className='flex shrink-0 items-center gap-2'>{actions}</div>}
            </div>
        </div>
    )
}
