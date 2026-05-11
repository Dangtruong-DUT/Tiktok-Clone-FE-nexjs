import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AdminLayout, AdminContainer, AdminHeader } from '@/components/admin'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { CommentTable } from './_components/comment-table'

export const metadata: Metadata = {
    title: 'Comment Moderation',
    description: 'Moderate and manage comments'
}

/**
 * AdminCommentsPage - Comment moderation page
 * Features:
 * - View all comments
 * - Search comments by content or author
 * - Delete comments
 * - View parent post context
 */
export default async function AdminCommentsPage() {
    const t = await getTranslations('AdminPage')

    return (
        <AdminLayout>
            <AdminHeader
                title={t('comments.title')}
                description={t('comments.description')}
                breadcrumbs={[
                    { label: t('breadcrumbs.home'), href: '/' },
                    { label: t('breadcrumbs.admin'), href: '/admin' },
                    { label: t('comments.title') }
                ]}
            />

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
