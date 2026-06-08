import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { LocalesType } from '@/i18n/config'
import envConfig from '@/config/app.config'
import { AdminLayout, AdminContainer } from '@/components/admin'
import { AdminSettingsContent } from './_components/admin-settings-content'
import { ADMIN_ROUTES } from '@/constants/routes/routes'

export async function generateMetadata({ params }: { params: Promise<{ locale: LocalesType }> }): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations('AdminPage')

    return {
        title: t('settings.title'),
        description: t('settings.description'),
        alternates: {
            canonical: `${envConfig.NEXT_PUBLIC_URL}/${locale}/admin/settings`,
            languages: {
                'en-US': `${envConfig.NEXT_PUBLIC_URL}/en/admin/settings`,
                'vi-VN': `${envConfig.NEXT_PUBLIC_URL}/vi/admin/settings`
            }
        }
    }
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
