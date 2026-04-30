'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Shield, AlertTriangle, Clock, CheckCircle2, ArrowRight, ArrowLeft, Loader2, Scale, Send, LogIn } from 'lucide-react'
import { useGetAppealQuery, useCreateAppealMutation } from '@/store/services/appeal.service'
import { useAppSelector } from '@/store/hooks'
import { AppealStepper } from './appeal-stepper'
import { EvidenceDropzone } from './evidence-dropzone'
import { Link } from '@/i18n/navigation'

interface AppealFormClientProps {
    token?: string
    appealUuid?: string
}

const TOKEN_STEPS = [
    { label: 'Verify', icon: 'verify' as const },
    { label: 'Details', icon: 'details' as const },
    { label: 'Evidence', icon: 'upload' as const },
    { label: 'Confirm', icon: 'confirm' as const }
]

const AUTH_STEPS = [
    { label: 'Details', icon: 'details' as const },
    { label: 'Evidence', icon: 'upload' as const },
    { label: 'Confirm', icon: 'confirm' as const }
]

const SLIDE_VARIANTS = {
    enter: (direction: number) => ({
        x: direction > 0 ? 80 : -80,
        opacity: 0
    }),
    center: {
        x: 0,
        opacity: 1
    },
    exit: (direction: number) => ({
        x: direction < 0 ? 80 : -80,
        opacity: 0
    })
}

/**
 * Multi-step appeal wizard with premium UI.
 *
 * Supports two flows:
 * - Token flow: User arrives via email link with token + appeal_uuid.
 *   Verifies token → fill reason → upload evidence → submit.
 * - Auth flow: User arrives from notification with appeal_uuid (no token).
 *   Must be authenticated. Shows appeal info → fill reason → upload evidence → submit.
 */
export function AppealFormClient({ token, appealUuid }: AppealFormClientProps) {
    const t = useTranslations('AppealPage')
    const isAuthenticated = useAppSelector((state) => state.auth.role != null)

    const isTokenFlow = !!token && !!appealUuid
    const isAuthFlow = !token && !!appealUuid

    const [currentStep, setCurrentStep] = useState(isTokenFlow ? 0 : 0)
    const [direction, setDirection] = useState(0)
    const [reason, setReason] = useState('')
    const [evidenceFiles, setEvidenceFiles] = useState<File[]>([])

    // Fetch appeal info — token-based or auth-based
    const {
        data: appealData,
        isLoading: isLoadingAppeal,
        isError: isAppealError,
        error: appealError
    } = useGetAppealQuery(
        { uuid: appealUuid ?? '', token: token || undefined },
        { skip: !appealUuid }
    )

    const [createAppeal, { isLoading: isSubmitting }] = useCreateAppealMutation()

    const steps = isTokenFlow ? TOKEN_STEPS : AUTH_STEPS
    const lastStepIndex = steps.length - 1
    const submitStepIndex = lastStepIndex - 1

    // Token flow: auto-advance from verify step after successful verification
    useEffect(() => {
        if (isTokenFlow && appealData?.data && currentStep === 0) {
            const timer = setTimeout(() => {
                setDirection(1)
                setCurrentStep(1)
            }, 1200)
            return () => clearTimeout(timer)
        }
    }, [isTokenFlow, appealData, currentStep])

    const appealInfo = appealData?.data

    const canProceedToEvidence = reason.trim().length >= 20

    const handleNext = useCallback(() => {
        const detailsStep = isTokenFlow ? 1 : 0
        if (currentStep === detailsStep && !canProceedToEvidence) {
            toast.error(t('form.reasonMinError'))
            return
        }
        setDirection(1)
        setCurrentStep((prev) => Math.min(prev + 1, lastStepIndex))
    }, [currentStep, canProceedToEvidence, t, isTokenFlow, lastStepIndex])

    const handleBack = useCallback(() => {
        const minStep = isTokenFlow ? 1 : 0
        setDirection(-1)
        setCurrentStep((prev) => Math.max(prev - 1, minStep))
    }, [isTokenFlow])

    const handleSubmit = useCallback(async () => {
        if (!appealUuid) return

        const formData = new FormData()
        formData.append('reason', reason.trim())

        if (token) {
            formData.append('token', token)
        } else if (appealUuid) {
            // Auth flow: send UUID so backend can verify ownership
            formData.append('appeal_uuid', appealUuid)
        }

        evidenceFiles.forEach((file) => {
            formData.append('evidence_files[]', file)
        })

        try {
            await createAppeal(formData).unwrap()
            setDirection(1)
            setCurrentStep(lastStepIndex)
        } catch (error) {
            const errorMessage = (error as { data?: { message?: string } })?.data?.message
            toast.error(errorMessage || t('form.submitError'))
        }
    }, [appealUuid, token, reason, evidenceFiles, createAppeal, t, lastStepIndex])

    const stepLabels = useMemo(
        () =>
            steps.map((step) => ({
                ...step,
                label: t(`steps.${step.icon}`)
            })),
        [t, steps]
    )

    const errorMessage = useMemo(() => {
        if (!appealError) return null
        const err = appealError as { data?: { message?: string } }
        return err?.data?.message || t('token.invalidGeneric')
    }, [appealError, t])

    // No appeal_uuid and no token — need login or invalid access
    if (!appealUuid && !token) {
        if (isAuthenticated) {
            return (
                <div className='w-full rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm md:p-10'>
                    <div className='flex flex-col items-center text-center gap-4'>
                        <div className='rounded-full bg-amber-50 p-4'>
                            <AlertTriangle className='h-8 w-8 text-amber-600' />
                        </div>
                        <h1 className='text-2xl font-bold text-black'>{t('token.missingTitle')}</h1>
                        <p className='text-neutral-600 max-w-md'>{t('token.missingDescription')}</p>
                    </div>
                </div>
            )
        }

        return (
            <div className='w-full rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm md:p-10'>
                <div className='flex flex-col items-center text-center gap-4'>
                    <div className='rounded-full bg-amber-50 p-4'>
                        <LogIn className='h-8 w-8 text-amber-600' />
                    </div>
                    <h1 className='text-2xl font-bold text-black'>{t('token.loginRequired')}</h1>
                    <p className='text-neutral-600 max-w-md'>{t('token.loginDescription')}</p>
                    <Link
                        href='/login'
                        className='inline-flex items-center gap-2 rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800'
                    >
                        <LogIn className='h-4 w-4' />
                        {t('token.loginAction')}
                    </Link>
                </div>
            </div>
        )
    }

    // Auth flow but not authenticated
    if (isAuthFlow && !isAuthenticated) {
        return (
            <div className='w-full rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm md:p-10'>
                <div className='flex flex-col items-center text-center gap-4'>
                    <div className='rounded-full bg-amber-50 p-4'>
                        <LogIn className='h-8 w-8 text-amber-600' />
                    </div>
                    <h1 className='text-2xl font-bold text-black'>{t('token.loginRequired')}</h1>
                    <p className='text-neutral-600 max-w-md'>{t('token.loginDescription')}</p>
                    <Link
                        href={`/login?redirect=/appeal?appeal_uuid=${appealUuid}`}
                        className='inline-flex items-center gap-2 rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800'
                    >
                        <LogIn className='h-4 w-4' />
                        {t('token.loginAction')}
                    </Link>
                </div>
            </div>
        )
    }

    // Error state
    if (isAppealError) {
        const isExpired = errorMessage?.toLowerCase().includes('expired')
        return (
            <div className='w-full rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm md:p-10'>
                <div className='flex flex-col items-center text-center gap-4'>
                    <div className={`rounded-full p-4 ${isExpired ? 'bg-amber-50' : 'bg-red-50'}`}>
                        {isExpired ? (
                            <Clock className='h-8 w-8 text-amber-600' />
                        ) : (
                            <AlertTriangle className='h-8 w-8 text-red-600' />
                        )}
                    </div>
                    <h1 className='text-2xl font-bold text-black'>
                        {isExpired ? t('token.expiredTitle') : t('token.invalidTitle')}
                    </h1>
                    <p className='text-neutral-600 max-w-md'>{errorMessage}</p>
                    <p className='text-sm text-neutral-500'>{t('token.contactSupport')}</p>
                </div>
            </div>
        )
    }

    // Determine current step content based on flow
    const getStepContent = () => {
        if (isTokenFlow) {
            // Token flow steps: 0=verify, 1=details, 2=evidence, 3=success
            if (currentStep === 0) return 'verify'
            if (currentStep === 1) return 'details'
            if (currentStep === 2) return 'evidence'
            return 'success'
        }
        // Auth flow steps: 0=details, 1=evidence, 2=success
        if (currentStep === 0) return 'details'
        if (currentStep === 1) return 'evidence'
        return 'success'
    }

    const stepContent = getStepContent()
    const detailsStep = isTokenFlow ? 1 : 0

    return (
        <div className='w-full rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-10'>
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

            {/* Stepper */}
            <div className='mb-8'>
                <AppealStepper currentStep={currentStep} steps={stepLabels} />
            </div>

            {/* Step content */}
            <div className='relative min-h-[280px]'>
                <AnimatePresence custom={direction} mode='wait'>
                    {/* Verify step (token flow only) */}
                    {stepContent === 'verify' && (
                        <motion.div
                            key='step-verify'
                            custom={direction}
                            variants={SLIDE_VARIANTS}
                            initial='enter'
                            animate='center'
                            exit='exit'
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className='flex flex-col items-center justify-center gap-4 py-12'
                        >
                            {isLoadingAppeal ? (
                                <>
                                    <Loader2 className='h-10 w-10 animate-spin text-black' />
                                    <p className='text-neutral-600 font-medium'>{t('token.verifying')}</p>
                                </>
                            ) : appealInfo ? (
                                <>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                        className='rounded-full bg-green-50 p-4'
                                    >
                                        <Shield className='h-8 w-8 text-green-600' />
                                    </motion.div>
                                    <p className='text-green-700 font-medium'>{t('token.verified')}</p>
                                </>
                            ) : null}
                        </motion.div>
                    )}

                    {/* Details step */}
                    {stepContent === 'details' && (
                        <motion.div
                            key='step-details'
                            custom={direction}
                            variants={SLIDE_VARIANTS}
                            initial='enter'
                            animate='center'
                            exit='exit'
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className='space-y-5'
                        >
                            {/* Appeal info summary */}
                            {appealInfo && (
                                <div className='rounded-2xl bg-neutral-50 p-4'>
                                    <div className='grid grid-cols-2 gap-3 text-sm'>
                                        <div>
                                            <span className='text-neutral-500'>{t('form.appealType')}</span>
                                            <p className='font-medium text-black mt-0.5'>
                                                {t(`types.${appealInfo.appeal_type}`)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className='text-neutral-500'>{t('form.resourceType')}</span>
                                            <p className='font-medium text-black mt-0.5'>{appealInfo.resource_type}</p>
                                        </div>
                                        <div>
                                            <span className='text-neutral-500'>{t('form.status')}</span>
                                            <p className='font-medium text-black mt-0.5'>
                                                {t(`statuses.${appealInfo.status}`)}
                                            </p>
                                        </div>
                                        {appealInfo.appeal_token_expires_at && (
                                            <div>
                                                <span className='text-neutral-500'>{t('form.expiresAt')}</span>
                                                <p className='font-medium text-black mt-0.5'>
                                                    {new Date(appealInfo.appeal_token_expires_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {isLoadingAppeal && (
                                <div className='flex items-center justify-center py-8'>
                                    <Loader2 className='h-8 w-8 animate-spin text-neutral-400' />
                                </div>
                            )}

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
                        </motion.div>
                    )}

                    {/* Evidence step */}
                    {stepContent === 'evidence' && (
                        <motion.div
                            key='step-upload'
                            custom={direction}
                            variants={SLIDE_VARIANTS}
                            initial='enter'
                            animate='center'
                            exit='exit'
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className='space-y-5'
                        >
                            <div>
                                <h3 className='text-sm font-medium text-black'>{t('form.evidenceLabel')}</h3>
                                <p className='text-xs text-neutral-500 mt-0.5'>{t('form.evidenceHint')}</p>
                            </div>
                            <EvidenceDropzone files={evidenceFiles} onFilesChange={setEvidenceFiles} />

                            {/* Summary before submit */}
                            <div className='rounded-2xl bg-neutral-50 p-4 space-y-2'>
                                <p className='text-xs font-medium text-neutral-600 uppercase tracking-wide'>
                                    {t('form.summaryTitle')}
                                </p>
                                <div className='text-sm text-neutral-700'>
                                    <p>
                                        <span className='text-neutral-500'>{t('form.reasonLabel')}:</span>{' '}
                                        {reason.trim().length > 80 ? reason.trim().slice(0, 80) + '...' : reason.trim()}
                                    </p>
                                    <p>
                                        <span className='text-neutral-500'>{t('form.evidenceCount')}:</span>{' '}
                                        {evidenceFiles.length} {t('form.files')}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Success step */}
                    {stepContent === 'success' && (
                        <motion.div
                            key='step-success'
                            custom={direction}
                            variants={SLIDE_VARIANTS}
                            initial='enter'
                            animate='center'
                            exit='exit'
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className='flex flex-col items-center justify-center gap-4 py-12 text-center'
                        >
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation buttons */}
            {stepContent !== 'verify' && stepContent !== 'success' && (
                <div className='mt-6 flex items-center justify-between gap-3'>
                    <Button
                        variant='outline'
                        onClick={handleBack}
                        disabled={currentStep <= detailsStep || isSubmitting}
                        className='rounded-full px-6'
                    >
                        <ArrowLeft className='mr-1.5 h-4 w-4' />
                        {t('form.back')}
                    </Button>

                    {currentStep === submitStepIndex ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className='rounded-full bg-black px-6 text-white hover:bg-neutral-800'
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
                    ) : (
                        <Button
                            onClick={handleNext}
                            disabled={currentStep === detailsStep && !canProceedToEvidence}
                            className='rounded-full bg-black px-6 text-white hover:bg-neutral-800'
                        >
                            {t('form.next')}
                            <ArrowRight className='ml-1.5 h-4 w-4' />
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}
