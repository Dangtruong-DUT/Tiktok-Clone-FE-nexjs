'use client'

import { useCallback, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { AlertTriangle, CheckCircle2, Loader2, Scale, Send, LogIn } from 'lucide-react'
import {
    useGetAppealQuery,
    useCreateAppealMutation,
    useUpdateAppealMutation
} from '@/store/services/appeal.service'
import { useAppSelector } from '@/store/hooks'
import { EvidenceDropzone } from './evidence-dropzone'
import { Link } from '@/i18n/navigation'
interface AppealFormClientProps {
    appealUuid?: string
    appealType?: string
    resourceType?: string
    resourceId?: string
}

export function AppealFormClient({ appealUuid, appealType, resourceType, resourceId }: AppealFormClientProps) {
    const t = useTranslations('AppealPage')
    const tTypes = useTranslations('AppealPage.types')
    const tStatuses = useTranslations('AppealPage.statuses')
    const isAuthenticated = useAppSelector((state) => state.auth.role != null)

    const isEditFlow = !!appealUuid
    const isNewFlow = !appealUuid && !!appealType

    const [reason, setReason] = useState('')
    const [evidenceFiles, setEvidenceFiles] = useState<File[]>([])
    const [isSubmitted, setIsSubmitted] = useState(false)

    const {
        data: appealData,
        isLoading: isFetchingAppeal,
        isError: isFetchError,
        error: fetchError
    } = useGetAppealQuery({ uuid: appealUuid ?? '' }, { skip: !appealUuid })

    const existingAppealInfo = appealData?.data

    const [createAppeal, { isLoading: isCreating }] = useCreateAppealMutation()
    const [updateAppeal, { isLoading: isUpdating }] = useUpdateAppealMutation()

    const isSubmitting = isCreating || isUpdating

    const appealInfo = useMemo(() => {
        if (isNewFlow) {
            return {
                appeal_type: appealType,
                resource_type: resourceType,
                status: 'pending'
            }
        }
        if (isEditFlow && existingAppealInfo) {
            return {
                appeal_type: existingAppealInfo.appeal_type,
                resource_type: existingAppealInfo.resource_type,
                status: existingAppealInfo.status
            }
        }
        return null
    }, [isNewFlow, appealType, resourceType, isEditFlow, existingAppealInfo])

    const canSubmit = reason.trim().length >= 20

    const handleSubmit = useCallback(async () => {
        if (!canSubmit) {
            toast.error(t('form.reasonMinError'))
            return
        }

        const formData = new FormData()
        formData.append('reason', reason.trim())

        if (isNewFlow) {
            formData.append('appeal_type', appealType || '')
            formData.append('resource_type', resourceType || '')
            if (resourceId) {
                formData.append('resource_id', resourceId)
            }
        } else if (isEditFlow && appealUuid) {
            formData.append('_method', 'PUT')
        }

        evidenceFiles.forEach((file) => {
            formData.append('evidence_files[]', file)
        })

        try {
            if (isEditFlow && appealUuid) {
                await updateAppeal({ uuid: appealUuid, data: formData }).unwrap()
            } else {
                await createAppeal(formData).unwrap()
            }
            setIsSubmitted(true)
        } catch (error) {
            const errorMessage = (error as { data?: { message?: string } })?.data?.message
            toast.error(errorMessage || t('form.submitError'))
        }
    }, [
        canSubmit,
        appealUuid,
        reason,
        evidenceFiles,
        createAppeal,
        t,
        isNewFlow,
        appealType,
        resourceType,
        resourceId,
        isEditFlow,
        updateAppeal
    ])

    const isInvalidFlow = !isNewFlow && !isEditFlow

    // Not authenticated — show login prompt
    if (!isAuthenticated) {
        const redirectUrl = isNewFlow
            ? `/appeal?appeal_type=${appealType}&resource_type=${resourceType}${resourceId ? `&resource_id=${resourceId}` : ''}`
            : isEditFlow
              ? `/appeal?appeal_uuid=${appealUuid}`
              : '/appeal'
        return (
            <div className='w-full rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm md:p-10'>
                <div className='flex flex-col items-center text-center gap-4'>
                    <div className='rounded-full bg-amber-50 p-4'>
                        <LogIn className='h-8 w-8 text-amber-600' />
                    </div>
                    <h1 className='text-2xl font-bold text-black'>{t('auth.loginRequired')}</h1>
                    <p className='text-neutral-600 max-w-md'>{t('auth.loginDescription')}</p>
                    <Link
                        href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
                        className='inline-flex items-center gap-2 rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800'
                    >
                        <LogIn className='h-4 w-4' />
                        {t('auth.loginAction')}
                    </Link>
                </div>
            </div>
        )
    }

    // Invalid flow state (missing required parameters)
    if (isInvalidFlow) {
        return (
            <div className='w-full rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm md:p-10'>
                <div className='flex flex-col items-center text-center gap-4'>
                    <div className='rounded-full bg-amber-50 p-4'>
                        <AlertTriangle className='h-8 w-8 text-amber-600' />
                    </div>
                    <h1 className='text-2xl font-bold text-black'>{t('error.missingTitle')}</h1>
                    <p className='text-neutral-600 max-w-md'>{t('error.missingDescription')}</p>
                </div>
            </div>
        )
    }

    // Error state
    if (isFetchError) {
        const err = fetchError as { data?: { message?: string } }
        const errorMessage = err?.data?.message || t('error.invalidGeneric')
        return (
            <div className='w-full rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm md:p-10'>
                <div className='flex flex-col items-center text-center gap-4'>
                    <div className='rounded-full bg-red-50 p-4'>
                        <AlertTriangle className='h-8 w-8 text-red-600' />
                    </div>
                    <h1 className='text-2xl font-bold text-black'>{t('error.invalidTitle')}</h1>
                    <p className='text-neutral-600 max-w-md'>{errorMessage}</p>
                </div>
            </div>
        )
    }

    // Loading state for edit flow
    if (isFetchingAppeal) {
        return (
            <div className='w-full rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm md:p-10'>
                <div className='flex flex-col items-center justify-center gap-4 py-12'>
                    <Loader2 className='h-10 w-10 animate-spin text-black' />
                    <p className='text-neutral-600 font-medium'>{t('error.loading')}</p>
                </div>
            </div>
        )
    }

    // Success state
    if (isSubmitted) {
        return (
            <div className='w-full rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-10'>
                <div className='flex flex-col items-center justify-center gap-4 py-12 text-center'>
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                        className='rounded-full bg-green-50 p-5'
                    >
                        <CheckCircle2 className='h-10 w-10 text-green-600' />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className='space-y-2'
                    >
                        <h2 className='text-xl font-bold text-black'>{t('success.title')}</h2>
                        <p className='text-neutral-600 max-w-sm'>{t('success.description')}</p>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className='text-xs text-neutral-400 mt-2'
                    >
                        {t('success.notice')}
                    </motion.p>
                </div>
            </div>
        )
    }

    // Main form — single step: reason + evidence + submit
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className='w-full rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-10'
        >
            {/* Header */}
            <div className='mb-6 flex items-center gap-3'>
                <div className='rounded-full bg-neutral-100 p-3'>
                    <Scale className='h-6 w-6 text-black' />
                </div>
                <div>
                    <h1 className='text-xl font-bold text-black md:text-2xl'>{t('title')}</h1>
                    <p className='text-sm text-neutral-500'>{t('description')}</p>
                </div>
            </div>

            <div className='space-y-5'>
                {/* Appeal info summary */}
                {appealInfo && (
                    <div className='rounded-2xl bg-neutral-50 p-4'>
                        <div className='grid grid-cols-2 gap-3 text-sm'>
                            <div>
                                <span className='text-neutral-500'>{t('form.appealType')}</span>
                                <p className='font-medium text-black mt-0.5'>
                                    {appealInfo.appeal_type ? tTypes(appealInfo.appeal_type as any) : '—'}
                                </p>
                            </div>
                            <div>
                                <span className='text-neutral-500'>{t('form.resourceType')}</span>
                                <p className='font-medium text-black mt-0.5'>{appealInfo.resource_type}</p>
                            </div>
                            {isEditFlow && (
                                <div>
                                    <span className='text-neutral-500'>{t('form.status')}</span>
                                    <p className='font-medium text-black mt-0.5'>
                                        {appealInfo.status ? tStatuses(appealInfo.status as any) : '—'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Reason textarea */}
                <div className='space-y-2'>
                    <label htmlFor='appeal-reason' className='text-sm font-medium text-black'>
                        {t('form.reasonLabel')} <span className='text-red-500'>*</span>
                    </label>
                    <Textarea
                        id='appeal-reason'
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder={t('form.reasonPlaceholder')}
                        className='min-h-[140px] resize-none rounded-xl border-neutral-300 focus:border-black focus:ring-black'
                    />
                    <div className='flex justify-between text-xs'>
                        <span className={reason.trim().length < 20 ? 'text-red-500' : 'text-green-600'}>
                            {reason.trim().length}/1000
                        </span>
                        <span className='text-neutral-400'>{t('form.reasonHint')}</span>
                    </div>
                </div>

                {/* Evidence dropzone */}
                <div>
                    <h3 className='text-sm font-medium text-black'>{t('form.evidenceLabel')}</h3>
                    <p className='text-xs text-neutral-500 mt-0.5 mb-2'>{t('form.evidenceHint')}</p>
                    <EvidenceDropzone files={evidenceFiles} onFilesChange={setEvidenceFiles} />
                </div>

                {/* Submit button */}
                <div className='pt-2'>
                    <Button
                        onClick={handleSubmit}
                        disabled={!canSubmit || isSubmitting}
                        className='w-full rounded-full bg-black px-6 py-3 text-white hover:bg-neutral-800 transition-colors'
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className='mr-1.5 h-4 w-4 animate-spin' />
                                {t('form.submitting')}
                            </>
                        ) : (
                            <>
                                <Send className='mr-1.5 h-4 w-4' />
                                {t('form.submit')}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}
