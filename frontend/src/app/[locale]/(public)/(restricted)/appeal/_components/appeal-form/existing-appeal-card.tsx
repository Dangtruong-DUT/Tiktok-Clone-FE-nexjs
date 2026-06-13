import { motion } from 'framer-motion'
import { Clock, Edit2, ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/i18n/navigation'
import { APP_ROUTES } from '@/constants/routes/routes'
import { formatDateTime } from '@/utils/formatting/format-time.util'
import { ResourcePreview } from '../resource-preview'
import { APPEAL_STATUSES } from '@/constants/appeal'
import { APPEAL_STATUS_STYLES } from '../constants/appeal-page.constants'
import type { Appeal } from '@/types/models/appeal.model'

export function ExistingAppealCard({ appeal }: { appeal: Appeal }) {
    const t = useTranslations('AppealPage')
    const tStatuses = useTranslations('AppealPage.statuses')
    const tTypes = useTranslations('AppealPage.types')

    const conf = APPEAL_STATUS_STYLES[appeal.status as keyof typeof APPEAL_STATUS_STYLES] ?? APPEAL_STATUS_STYLES.pending

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className='w-full rounded-3xl border border-slate-200/80 bg-white p-8 shadow-lg shadow-slate-200/60 md:p-10'
        >
            <div className='flex flex-col gap-6'>
                <div className='flex items-center gap-4'>
                    <div className={`rounded-2xl p-3.5 ring-8 ${conf?.icon} ${conf?.ring}`}>
                        <Clock className='h-6 w-6' />
                    </div>
                    <div>
                        <h1 className='text-xl font-bold text-slate-900 tracking-tight'>{t('existing.title')}</h1>
                        <p className='text-sm text-slate-500 mt-0.5'>{t('existing.description')}</p>
                    </div>
                </div>

                <div className='rounded-2xl bg-slate-50/80 border border-slate-100 p-5 space-y-4'>
                    <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div className='space-y-1'>
                            <span className='text-[10px] font-semibold text-slate-400 uppercase tracking-wider'>{t('form.appealType')}</span>
                            <p className='font-semibold text-slate-800'>{tTypes(appeal.appeal_type as never)}</p>
                        </div>
                        <div className='space-y-1'>
                            <span className='text-[10px] font-semibold text-slate-400 uppercase tracking-wider'>{t('form.resourceType')}</span>
                            <p className='font-semibold text-slate-800 capitalize'>{appeal.resource_type}</p>
                        </div>
                        <div className='space-y-1'>
                            <span className='text-[10px] font-semibold text-slate-400 uppercase tracking-wider'>{t('existing.submittedAt')}</span>
                            <p className='font-semibold text-slate-800'>{formatDateTime(appeal.created_at)}</p>
                        </div>
                        <div className='space-y-1'>
                            <span className='text-[10px] font-semibold text-slate-400 uppercase tracking-wider'>{t('form.status')}</span>
                            <div className='mt-0.5'>
                                <Badge variant='outline' className={`${conf?.badge} text-xs font-semibold`}>
                                    {tStatuses(appeal.status as never)}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    {appeal.resource_preview && <ResourcePreview preview={appeal.resource_preview} />}
                </div>

                {appeal.reason && (
                    <div className='space-y-2'>
                        <p className='text-[10px] font-semibold text-slate-400 uppercase tracking-wider'>
                            {t('existing.yourReason')}
                        </p>
                        <p className='text-sm text-slate-700 rounded-xl bg-slate-50 p-4 border border-slate-100 leading-relaxed'>
                            {appeal.reason}
                        </p>
                    </div>
                )}

                {appeal.admin_response && (
                    <div className='space-y-2'>
                        <p className='text-[10px] font-semibold text-slate-400 uppercase tracking-wider'>
                            {t('existing.adminResponse')}
                        </p>
                        <p className='text-sm text-slate-700 rounded-xl bg-slate-50 p-4 border border-slate-100 leading-relaxed'>
                            {appeal.admin_response}
                        </p>
                    </div>
                )}

                <div className='flex flex-col gap-2.5 pt-2'>
                    {appeal.uuid && appeal.status === APPEAL_STATUSES.PENDING && (
                        <Link
                            href={`${APP_ROUTES.APPEAL}?appeal_uuid=${appeal.uuid}`}
                            className='inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] shadow-sm'
                        >
                            <Edit2 className='h-4 w-4' />
                            {t('existing.editAppeal')}
                        </Link>
                    )}
                    <Link
                        href={APP_ROUTES.HOME}
                        className='inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98]'
                    >
                        <ArrowLeft className='h-4 w-4' />
                        {t('existing.goBack')}
                    </Link>
                </div>
            </div>
        </motion.div>
    )
}
