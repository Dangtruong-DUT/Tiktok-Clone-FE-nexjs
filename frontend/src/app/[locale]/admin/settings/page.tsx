import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AdminLayout, AdminContainer } from '@/components/admin'
import { AdminSettingsContent } from './_components/admin-settings-content'
import { ADMIN_ROUTES } from '@/constants/routes/routes'

export const metadata: Metadata = {
    title: 'Admin Settings',
    description: 'Manage your admin account settings'
}

export default async function AdminSettingsPage() {
    const t = await getTranslations('AdminPage')

    return (
        <AdminLayout
            title={t('settings.title')}
            description={t('settings.description')}
            breadcrumbs={[
                { label: t('breadcrumbs.admin'), href: ADMIN_ROUTES.DASHBOARD },
                { label: t('settings.title') }
            ]}
        >
            <AdminContainer>
                <AdminSettingsContent />
            </AdminContainer>
        </AdminLayout>
    )
}
