import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { LocalesType } from '@/i18n/config'
import envConfig from '@/config/app.config'
import { AdminLayout, AdminContainer } from '@/components/admin'
import { DashboardStats } from './_components/dashboard-stats'
import { DashboardNeedsReview } from './_components/dashboard-needs-review'
import { DashboardRecentActivity } from './_components/dashboard-recent-activity'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export async function generateMetadata({ params }: { params: Promise<{ locale: LocalesType }> }): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations('AdminPage')

    return {
        title: t('dashboard.title'),
        description: t('dashboard.description'),
        alternates: {
            canonical: `${envConfig.NEXT_PUBLIC_URL}/${locale}/admin`,
            languages: {
                'en-US': `${envConfig.NEXT_PUBLIC_URL}/en/admin`,
                'vi-VN': `${envConfig.NEXT_PUBLIC_URL}/vi/admin`
            }
        }
    }
}

export default async function AdminDashboardPage() {
    const t = await getTranslations('AdminPage')

    return (
        <AdminLayout title={t('dashboard.title')} description={t('dashboard.description')}>
            <AdminContainer>
                <div className='space-y-6'>
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
