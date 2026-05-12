import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AdminLayout, AdminContainer } from '@/components/admin'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { UserTable } from './_components/user-table'

export const metadata: Metadata = {
    title: 'User Management',
    description: 'Manage users in the system'
}

export default async function AdminUsersPage() {
    const t = await getTranslations('AdminPage')

    return (
        <AdminLayout
            title={t('users.title')}
            description={t('users.description')}
            breadcrumbs={[
                { label: t('breadcrumbs.admin'), href: '/admin' },
                { label: t('users.title') }
            ]}
        >
            <AdminContainer>
                <Suspense
                    fallback={
                        <div className='space-y-4'>
                            <div className='flex gap-2'>
                                <Skeleton className='h-10 flex-1' />
                                <Skeleton className='h-10 w-32' />
                            </div>
                            <div className='rounded-xl border bg-background shadow-sm overflow-hidden'>
                                <div className='p-4 space-y-3'>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Skeleton key={i} className='h-16' />
                                    ))}
                                </div>
                            </div>
                        </div>
                    }
                >
                    <UserTable />
                </Suspense>
            </AdminContainer>
        </AdminLayout>
    )
}
