import { redirect } from 'next/navigation'
import { LocalesType } from '@/i18n/config'
import { ADMIN_ROUTES } from '@/constants/routes/routes'

export default async function AdminRootRedirect({
    params
}: {
    params: Promise<{ locale: LocalesType }>
}) {
    const { locale } = await params
    redirect(`/${locale}${ADMIN_ROUTES.DASHBOARD}`)
}
