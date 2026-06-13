import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { LocalesType } from '@/i18n/config'
import envConfig from '@/config/app.config'
import { AdminLayout, AdminContainer } from '@/components/admin'
import { DashboardStats } from '../admin/_components/dashboard-stats'
import { DashboardNeedsReview } from '../admin/_components/dashboard-needs-review'
import { DashboardRecentActivity } from '../admin/_components/dashboard-recent-activity'
import { UserGrowthChart } from '../admin/_components/user-growth-chart'
import { ContentStatusChart } from '../admin/_components/content-status-chart'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export async function generateMetadata({ params }: { params: Promise<{ locale: LocalesType }> }): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations('AdminPage')

    return {
        title: t('dashboard.title'),
        description: t('dashboard.description'),
        alternates: {
            canonical: `${envConfig.NEXT_PUBLIC_URL}/${locale}/dashboard`,
            languages: {
                'en-US': `${envConfig.NEXT_PUBLIC_URL}/en/dashboard`,
                'vi-VN': `${envConfig.NEXT_PUBLIC_URL}/vi/dashboard`
            }
        }
    }
}

export default async function AdminDashboardPage() {
    const t = await getTranslations('AdminPage')

    return (
        <AdminLayout title={t('dashboard.title')} description={t('dashboard.description')}>
            <AdminContainer>
                <div className='space-y-6 animate-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-forwards'>
                    <section>
                        <p className='mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
                            {t('dashboard.statistics')}
                        </p>
                        <Suspense
                            fallback={
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <Skeleton key={i} className='h-28' />
                                    ))}
                                </div>
                            }
                        >
                            <DashboardStats />
                        </Suspense>
                    </section>

                    <section>
                        <p className='mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
                            {t('dashboard.charts')}
                        </p>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <Suspense fallback={<Skeleton className='h-[220px]' />}>
                                <UserGrowthChart />
                            </Suspense>
                            <Suspense fallback={<Skeleton className='h-[220px]' />}>
                                <ContentStatusChart />
                            </Suspense>
                        </div>
                    </section>

                    <section className='grid grid-cols-1 lg:grid-cols-5 gap-6'>
                        <div className='lg:col-span-3 flex flex-col gap-4'>
                            <Suspense
                                fallback={
                                    <div className='space-y-2'>
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Skeleton key={i} className='h-14' />
                                        ))}
                                    </div>
                                }
                            >
                                <DashboardRecentActivity />
                            </Suspense>
                        </div>

                        <div className='lg:col-span-2'>
                            <Suspense fallback={<Skeleton className='h-40' />}>
                                <DashboardNeedsReview />
                            </Suspense>
                        </div>
                    </section>
                </div>
            </AdminContainer>
        </AdminLayout>
    )
}
