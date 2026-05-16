import { getTranslations } from 'next-intl/server'
import { PageLoading } from '@/components/page-loading'

export default async function Loading() {
    const t = await getTranslations('AdminPage')
    return <PageLoading message={t('common.loading')} />
}
