import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AdminLayout, AdminContainer, AdminHeader } from '@/components/admin'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { PostModerationTable } from './_components/post-moderation-table'

export const metadata: Metadata = {
    title: 'Post Moderation',
    description: 'Moderate and manage posts'
}

/**
 * AdminPostsPage - Post moderation page
 * Features:
 * - View all posts
 * - Search and filter posts
 * - Hide/Unhide posts
 * - Delete posts
 */
export default async function AdminPostsPage() {
    const t = await getTranslations('AdminPage')

    return (
        <AdminLayout>
            <AdminHeader
                title={t('posts.title')}
                description={t('posts.description')}
                breadcrumbs={[
                    { label: t('breadcrumbs.home'), href: '/' },
                    { label: t('breadcrumbs.admin'), href: '/admin' },
                    { label: t('posts.title') }
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
                            <div className='border rounded-lg'>
                                <div className='p-4 space-y-3'>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Skeleton key={i} className='h-16' />
                                    ))}
                                </div>
                            </div>
                        </div>
                    }
                >
                    <PostModerationTable />
                </Suspense>
            </AdminContainer>
        </AdminLayout>
    )
}
