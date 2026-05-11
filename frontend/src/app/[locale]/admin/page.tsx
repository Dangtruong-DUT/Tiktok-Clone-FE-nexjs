import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AdminLayout, AdminContainer, AdminHeader, DashboardStats, DashboardQuickActions } from '@/components/admin'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ActivityLog } from './activity/_components/activity-log'

export const metadata: Metadata = {
    title: 'Admin Dashboard',
    description: 'Admin panel for system management'
}

/**
 * AdminDashboardPage - Main admin dashboard
 * Displays:
 * - Dashboard statistics
 * - Recent activity log
 * - Quick overview of system state
 */
export default async function AdminDashboardPage() {
    const t = await getTranslations('AdminPage')

    return (
        <AdminLayout>
            <AdminHeader
                title={t('dashboard.title')}
                description={t('dashboard.description')}
                breadcrumbs={[{ label: t('breadcrumbs.home'), href: '/' }, { label: t('dashboard.title') }]}
            />

            <AdminContainer>
                <div className='space-y-8'>
                    {/* Dashboard Statistics */}
                    <section>
                        <h2 className='text-base font-semibold mb-4 text-muted-foreground uppercase tracking-wide'>{t('dashboard.statistics')}</h2>
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

                    {/* Quick Actions */}
                    <section>
                        <DashboardQuickActions />
                    </section>

                    {/* Recent Activity */}
                    <section>
                        <h2 className='text-base font-semibold mb-4 text-muted-foreground uppercase tracking-wide'>{t('dashboard.recentActivity')}</h2>
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
