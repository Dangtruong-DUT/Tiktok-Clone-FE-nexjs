import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AdminLayout, AdminContainer } from '@/components/admin'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { AppealTable } from './_components/appeal-table'

export const metadata: Metadata = {
    title: 'Appeal Moderation',
    description: 'Review and process user appeals'
}

export default async function AdminAppealsPage() {
    const t = await getTranslations('AdminPage')

    return (
        <AdminLayout
            title={t('appeals.title')}
            description={t('appeals.description')}
            breadcrumbs={[
                { label: t('breadcrumbs.admin'), href: '/admin' },
                { label: t('appeals.title') }
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
                    <AppealTable />
                </Suspense>
            </AdminContainer>
        </AdminLayout>
    )
}
