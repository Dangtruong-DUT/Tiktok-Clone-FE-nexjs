import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AdminLayout, AdminContainer, AdminHeader } from '@/components/admin'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ActivityLog } from './_components/activity-log'

export const metadata: Metadata = {
    title: 'System Activity',
    description: 'View system activity and events'
}

export default async function AdminActivityPage() {
    const t = await getTranslations('AdminPage')

    return (
        <AdminLayout>
            <AdminHeader
                title={t('activity.title')}
                description={t('activity.description')}
                breadcrumbs={[
                    { label: t('breadcrumbs.home'), href: '/' },
                    { label: t('breadcrumbs.admin'), href: '/admin' },
                    { label: t('activity.title') }
                ]}
            />

            <AdminContainer>
                <Suspense
                    fallback={
                        <div className='space-y-3'>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Skeleton key={i} className='h-24' />
                            ))}
                        </div>
                    }
                >
                    <ActivityLog type='all' />
                </Suspense>
            </AdminContainer>
        </AdminLayout>
    )
}
