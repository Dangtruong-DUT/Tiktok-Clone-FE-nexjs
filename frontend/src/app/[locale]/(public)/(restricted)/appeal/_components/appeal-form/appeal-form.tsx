import { motion } from 'framer-motion'
import { Scale } from 'lucide-react'
import LoadingIcon from '@/components/lottie-icons/loading'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { EvidenceDropzone } from '../evidence-dropzone'
import { ResourcePreview } from '../resource-preview'
import { APPEAL_STATUSES } from '@/constants/appeal'
import type { useAppealForm } from '../hooks/use-appeal-form'

interface AppealFormProps {
    form: ReturnType<typeof useAppealForm>
    onSubmit: () => void
    isSubmitting: boolean
    appealInfo: {
        appeal_type?: string
        resource_type?: string
        status?: string
    } | null
    isEditFlow: boolean
    isNewFlow: boolean
    isLoadingPreview: boolean
    newFlowPreview: any
    existingPreview: any
}

export function AppealForm({
    form,
    onSubmit,
    isSubmitting,
    appealInfo,
    isEditFlow,
    isNewFlow,
    isLoadingPreview,
    newFlowPreview,
    existingPreview
}: AppealFormProps) {
    const t = useTranslations('AppealPage')
    const tTypes = useTranslations('AppealPage.types')
    const tStatuses = useTranslations('AppealPage.statuses')

    const { reason, setReason, evidenceFiles, setEvidenceFiles, charCount, charProgress, canSubmit } = form

    return (
        <section className='relative w-full max-w-[1180px] mx-auto py-10 md:py-20 px-4 sm:px-6 bg-white'>
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24'>
                {/* ── Left: Context & Steps ── */}
                <div className='lg:col-span-5 order-2 lg:order-1'>
                    <div className='sticky top-24'>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className='inline-flex items-center justify-center rounded-2xl bg-[#1A233A] h-16 w-16 mb-8 shadow-sm'
                        >
                            <Scale className='h-7 w-7 text-white' />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.05, ease: 'easeOut' }}
                            className='text-[2rem] font-bold tracking-tight text-[#111827] md:text-4xl lg:text-[2.5rem] lg:leading-[1.2] mb-4'
                            style={{ textWrap: 'balance' } as React.CSSProperties}
                        >
                            {t('title')}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                            className='text-lg text-slate-500 mb-12 max-w-md leading-relaxed'
                        >
                            {t('description')}
                        </motion.p>

                        {/* Steps */}
                        <div className='flex flex-col relative ml-1'>
                            {[
                                { title: t('steps.submit'), desc: t('steps.submitDesc'), num: 1 },
                                { title: t('steps.review'), desc: t('steps.reviewDesc'), num: 2 },
                                { title: t('steps.decision'), desc: t('steps.decisionDesc'), num: 3 }
                            ].map((step, i) => (
                                <motion.div
                                    key={step.num}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.15 + i * 0.1, ease: 'easeOut' }}
                                    className='flex gap-5 mb-8 last:mb-0 relative'
                                >
                                    {/* Connector line */}
                                    {i < 2 && (
                                        <div className='absolute left-4 top-10 w-px h-[calc(100%+10px)] bg-slate-200' />
                                    )}

                                    <div className='flex flex-col items-center shrink-0 pt-0.5 relative z-10'>
                                        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-[#111827] text-white text-[13px] font-semibold shadow-sm'>
                                            {step.num}
                                        </div>
                                    </div>
                                    <div className='pt-1 pb-1'>
                                        <h3 className='font-semibold text-[#111827] text-[15px]'>{step.title}</h3>
                                        <p className='text-[14px] text-slate-500 mt-1.5 leading-relaxed pr-4'>
                                            {step.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Right: Form ── */}
                <div className='lg:col-span-7 order-1 lg:order-2'>
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                        className='w-full rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/40 p-8 sm:p-10 lg:p-12'
                    >
                        <div className='space-y-10'>
                            {/* Appeal meta */}
                            {appealInfo && (
                                <div className='space-y-6'>
                                    <div className='grid grid-cols-2 gap-6 text-sm pb-8 border-b border-slate-100'>
                                        <div className='space-y-1.5'>
                                            <span className='text-[11px] font-semibold text-slate-400 uppercase tracking-wider'>
                                                {t('form.appealType')}
                                            </span>
                                            <p className='font-semibold text-slate-900 text-[15px]'>
                                                {appealInfo.appeal_type ? tTypes(appealInfo.appeal_type as never) : '—'}
                                            </p>
                                        </div>
                                        <div className='space-y-1.5'>
                                            <span className='text-[11px] font-semibold text-slate-400 uppercase tracking-wider'>
                                                {t('form.resourceType')}
                                            </span>
                                            <p className='font-semibold text-slate-900 text-[15px] capitalize'>
                                                {appealInfo.resource_type}
                                            </p>
                                        </div>
                                        {isEditFlow && (
                                            <div className='col-span-2 space-y-1.5 mt-2'>
                                                <span className='text-[11px] font-semibold text-slate-400 uppercase tracking-wider block'>
                                                    {t('form.status')}
                                                </span>
                                                <Badge
                                                    variant='outline'
                                                    className={
                                                        appealInfo.status === APPEAL_STATUSES.APPROVED
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold px-2.5 py-0.5'
                                                            : appealInfo.status === APPEAL_STATUSES.REJECTED
                                                              ? 'bg-red-50 text-red-700 border-red-200 text-xs font-semibold px-2.5 py-0.5'
                                                              : 'bg-amber-50 text-amber-700 border-amber-200 text-xs font-semibold px-2.5 py-0.5'
                                                    }
                                                >
                                                    {appealInfo.status ? tStatuses(appealInfo.status as never) : '—'}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>

                                    {isEditFlow && existingPreview && <ResourcePreview preview={existingPreview} />}

                                    {isNewFlow &&
                                        (isLoadingPreview ? (
                                            <div className='h-20 animate-pulse rounded-2xl bg-slate-50' />
                                        ) : newFlowPreview ? (
                                            <ResourcePreview preview={newFlowPreview} />
                                        ) : null)}
                                </div>
                            )}

                            {/* Reason field */}
                            <div className='space-y-3'>
                                <div className='flex items-center justify-between'>
                                    <label htmlFor='appeal-reason' className='text-[15px] font-semibold text-slate-900'>
                                        {t('form.reasonLabel')} <span className='text-red-500'>*</span>
                                    </label>
                                    <span
                                        className={`text-[12px] font-medium tabular-nums transition-colors ${
                                            charCount < 20
                                                ? 'text-red-500'
                                                : charCount >= 900
                                                  ? 'text-amber-500'
                                                  : 'text-emerald-600'
                                        }`}
                                    >
                                        {charCount} / 1000
                                    </span>
                                </div>
                                <Textarea
                                    id='appeal-reason'
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder={t('form.reasonPlaceholder')}
                                    maxLength={1000}
                                    className='min-h-[160px] resize-none rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[15px] leading-relaxed text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus-visible:bg-white focus-visible:border-slate-400 focus-visible:ring-4 focus-visible:ring-slate-900/5 shadow-sm hover:border-slate-300'
                                />
                                {/* Progress bar */}
                                <div className='h-1 w-full rounded-full bg-slate-100 overflow-hidden'>
                                    <motion.div
                                        className={`h-full rounded-full transition-colors ${
                                            charCount < 20
                                                ? 'bg-red-400'
                                                : charCount >= 900
                                                  ? 'bg-amber-400'
                                                  : 'bg-emerald-500'
                                        }`}
                                        animate={{ width: `${charProgress * 100}%` }}
                                        transition={{ duration: 0.2, ease: 'easeOut' }}
                                    />
                                </div>
                                <p className='text-[13px] text-slate-500'>{t('form.reasonHint')}</p>
                            </div>

                            {/* Evidence upload */}
                            <div className='space-y-3'>
                                <div>
                                    <h3 className='text-[15px] font-semibold text-slate-900'>
                                        {t('form.evidenceLabel')}
                                    </h3>
                                    <p className='text-[13px] text-slate-500 mt-1'>{t('form.evidenceHint')}</p>
                                </div>
                                <EvidenceDropzone files={evidenceFiles} onFilesChange={setEvidenceFiles} />
                            </div>

                            {/* Submit */}
                            <div className='pt-4'>
                                <Button
                                    onClick={onSubmit}
                                    disabled={!canSubmit || isSubmitting}
                                    className='w-full rounded-2xl py-6 h-14 text-[15px] font-semibold bg-[#111827] text-white hover:bg-slate-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md flex items-center justify-center'
                                >
                                    {isSubmitting ? (
                                        <>
                                            <LoadingIcon className='mr-2 h-5 w-5' />
                                            {t('form.submitting')}
                                        </>
                                    ) : (
                                        t('form.submit')
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
