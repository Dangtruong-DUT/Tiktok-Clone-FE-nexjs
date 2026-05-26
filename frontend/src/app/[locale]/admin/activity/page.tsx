import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { LocalesType } from '@/i18n/config'
import envConfig from '@/config/app.config'
import { AdminLayout, AdminContainer } from '@/components/admin'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ActivityLog } from './_components/activity-log'
import { ADMIN_ROUTES } from '@/constants/routes/routes'

export async function generateMetadata({ params }: { params: Promise<{ locale: LocalesType }> }): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations('AdminPage')

    return {
        title: t('activity.title'),
        description: t('activity.description'),
        alternates: {
            canonical: `${envConfig.NEXT_PUBLIC_URL}/${locale}/admin/activity`,
            languages: {
                'en-US': `${envConfig.NEXT_PUBLIC_URL}/en/admin/activity`,
                'vi-VN': `${envConfig.NEXT_PUBLIC_URL}/vi/admin/activity`
            }
        }
    }
}

export default async function AdminActivityPage() {
    const t = await getTranslations('AdminPage')

    return (
        <AdminLayout
            title={t('activity.title')}
            description={t('activity.description')}
            breadcrumbs={[
                { label: t('breadcrumbs.admin'), href: ADMIN_ROUTES.DASHBOARD },
                { label: t('activity.title') }
            ]}
        >
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
