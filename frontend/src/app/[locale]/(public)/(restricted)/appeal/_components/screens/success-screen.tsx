import { motion } from 'framer-motion'
import { CheckCircle2, ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { APP_ROUTES } from '@/constants/routes/routes'

interface SuccessScreenProps {
    uuid: string | null
}

export function SuccessScreen({ uuid }: SuccessScreenProps) {
    const t = useTranslations('AppealPage')

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className='w-full rounded-3xl border border-slate-200/80 bg-white p-8 shadow-lg shadow-slate-200/60 md:p-10 relative overflow-hidden'
        >
            <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,_rgba(16,185,129,0.06)_0%,_transparent_70%)]' />
            <div className='relative flex flex-col items-center justify-center gap-5 py-10 text-center'>
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    className='rounded-2xl bg-emerald-50 p-5 ring-8 ring-emerald-50/60'
                >
                    <CheckCircle2 className='h-10 w-10 text-emerald-500' />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className='space-y-2'
                >
                    <h2 className='text-2xl font-bold text-slate-900 tracking-tight'>{t('success.title')}</h2>
                    <p className='text-slate-500 max-w-sm text-sm leading-relaxed'>{t('success.description')}</p>
                </motion.div>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className='text-xs text-slate-400'
                >
                    {t('success.notice')}
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className='flex flex-col items-center gap-2.5 pt-2'
                >
                    {uuid && (
                        <Link
                            href={`${APP_ROUTES.APPEAL}?appeal_uuid=${uuid}`}
                            className='inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] shadow-sm'
                        >
                            {t('success.viewAppeal')}
                        </Link>
                    )}
                    <Link
                        href={APP_ROUTES.HOME}
                        className='inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-7 py-2.5 text-sm text-slate-500 transition-all hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98]'
                    >
                        <ArrowLeft className='h-3.5 w-3.5' />
                        {t('success.goBack')}
                    </Link>
                </motion.div>
            </div>
        </motion.div>
    )
}
