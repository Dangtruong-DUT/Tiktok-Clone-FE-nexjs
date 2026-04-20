import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AdminLayout, AdminContainer, AdminHeader } from '@/components/admin'
import { Card, CardContent } from '@/components/ui/card'
import UpdateProfileForm from '@/app/[locale]/(user)/snapistudio/settings/update-profile-form'
import ChangePasswordForm from '@/app/[locale]/(user)/snapistudio/settings/change-password-form'

export const metadata: Metadata = {
    title: 'Admin Settings',
    description: 'Manage your admin account settings'
}

export default async function AdminSettingsPage() {
    const t = await getTranslations('AdminPage')

    return (
        <AdminLayout>
            <AdminHeader
                title={t('settings.title')}
                description={t('settings.description')}
                breadcrumbs={[
                    { label: t('breadcrumbs.home'), href: '/' },
                    { label: t('breadcrumbs.admin'), href: '/admin' },
                    { label: t('settings.title') }
                ]}
            />

            <AdminContainer>
                <div className='grid gap-6 xl:grid-cols-2'>
                    <Card className='overflow-hidden'>
                        <CardContent className='p-6'>
                            <UpdateProfileForm />
                        </CardContent>
                    </Card>

                    <Card className='overflow-hidden'>
                        <CardContent className='p-6'>
                            <ChangePasswordForm />
                        </CardContent>
                    </Card>
                </div>
            </AdminContainer>
        </AdminLayout>
    )
}
