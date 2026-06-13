import { motion } from 'framer-motion'
import { LogIn } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { APP_ROUTES, AUTH_ROUTES } from '@/constants/routes/routes'

interface AuthRequiredScreenProps {
    isNewFlow: boolean
    isEditFlow: boolean
    appealType?: string
    resourceType?: string
    resourceUuid?: string
    appealUuid?: string
}

export function AuthRequiredScreen({
    isNewFlow,
    isEditFlow,
    appealType,
    resourceType,
    resourceUuid,
    appealUuid
}: AuthRequiredScreenProps) {
    const t = useTranslations('AppealPage')

    const redirectUrl = isNewFlow
        ? `${APP_ROUTES.APPEAL}?appeal_type=${appealType}&resource_type=${resourceType}${resourceUuid ? `&resource_uuid=${resourceUuid}` : ''}`
        : isEditFlow
          ? `${APP_ROUTES.APPEAL}?appeal_uuid=${appealUuid}`
          : APP_ROUTES.APPEAL

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className='w-full rounded-3xl border border-slate-200/80 bg-white p-8 shadow-lg shadow-slate-200/60 md:p-10'
        >
            <div className='flex flex-col items-center text-center gap-5 py-4'>
                <div className='rounded-2xl bg-slate-100 p-4 ring-8 ring-slate-50'>
                    <LogIn className='h-8 w-8 text-slate-700' />
                </div>
                <div className='space-y-1.5'>
                    <h1 className='text-2xl font-bold text-slate-900 tracking-tight'>{t('auth.loginRequired')}</h1>
                    <p className='text-slate-500 max-w-md text-sm leading-relaxed'>{t('auth.loginDescription')}</p>
                </div>
                <Link
                    href={`${AUTH_ROUTES.LOGIN}?redirect=${encodeURIComponent(redirectUrl)}`}
                    className='inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] shadow-sm'
                >
                    <LogIn className='h-4 w-4' />
                    {t('auth.loginAction')}
                </Link>
            </div>
        </motion.div>
    )
}
