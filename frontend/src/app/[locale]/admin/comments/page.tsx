import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { LocalesType } from '@/i18n/config'
import envConfig from '@/config/app.config'
import { AdminLayout, AdminContainer } from '@/components/admin'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { CommentTable } from './_components/comment-table'
import { ADMIN_ROUTES } from '@/constants/routes/routes'

export async function generateMetadata({ params }: { params: Promise<{ locale: LocalesType }> }): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations('AdminPage')

    return {
        title: t('comments.title'),
        description: t('comments.description'),
        alternates: {
            canonical: `${envConfig.NEXT_PUBLIC_URL}/${locale}/admin/comments`,
            languages: {
                'en-US': `${envConfig.NEXT_PUBLIC_URL}/en/admin/comments`,
                'vi-VN': `${envConfig.NEXT_PUBLIC_URL}/vi/admin/comments`
            }
        }
    }
}

export default async function AdminCommentsPage() {
    const t = await getTranslations('AdminPage')

    return (
        <AdminLayout
            title={t('comments.title')}
            description={t('comments.description')}
            breadcrumbs={[
                { label: t('breadcrumbs.admin'), href: ADMIN_ROUTES.DASHBOARD },
                { label: t('comments.title') }
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
                    <CommentTable />
                </Suspense>
            </AdminContainer>
        </AdminLayout>
    )
}
