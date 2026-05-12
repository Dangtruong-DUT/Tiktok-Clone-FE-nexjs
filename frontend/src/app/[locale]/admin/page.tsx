import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AdminLayout, AdminContainer, DashboardStats, DashboardQuickActions } from '@/components/admin'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ActivityLog } from './activity/_components/activity-log'

export const metadata: Metadata = {
    title: 'Admin Dashboard',
    description: 'Admin panel for system management'
}

export default async function AdminDashboardPage() {
    const t = await getTranslations('AdminPage')

    return (
        <AdminLayout title={t('dashboard.title')} description={t('dashboard.description')}>
            <AdminContainer>
                <div className='space-y-8'>
                    <section>
                        <p className='mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
                            {t('dashboard.statistics')}
                        </p>
                        <Suspense
                            fallback={
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <Skeleton key={i} className='h-24' />
                                    ))}
                                </div>
                            }
                        >
                            <DashboardStats />
                        </Suspense>
                    </section>

                    <section>
                        <DashboardQuickActions />
                    </section>

                    <section>
                        <p className='mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
                            {t('dashboard.recentActivity')}
                        </p>
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
                    </section>
                </div>
            </AdminContainer>
        </AdminLayout>
    )
}
