'use client'

import { useCallback, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Clock,
    Edit2,
    Loader2,
    Scale,
    Send,
    LogIn,
    FileText,
    User,
    MessageCircle
} from 'lucide-react'
import LoadingIcon from '@/components/lottie-icons/loading'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { APPEAL_STATUSES, type AppealType } from '@/constants/appeal'
import {
    useGetAppealQuery,
    useGetMyAppealsQuery,
    useCreateAppealMutation,
    useUpdateAppealMutation,
    useGetResourcePreviewQuery
} from '@/store/services/appeal.service'
import { useAppSelector } from '@/store/hooks'
import { useAppContext } from '@/provider/app-provider'
import { AuthStatus } from '@/constants/status/async'
import { formatDateTime } from '@/utils/formatting/format-time.util'
import { EvidenceDropzone } from './evidence-dropzone'
import { Link } from '@/i18n/navigation'
import { APP_ROUTES, AUTH_ROUTES } from '@/constants/routes/routes'
import type { Appeal } from '@/types/models/appeal.model'
interface AppealFormClientProps {
    appealUuid?: string
    appealType?: string
    resourceType?: string
    resourceUuid?: string
}

function ResourcePreviewInline({
    preview
}: {
    preview: NonNullable<import('@/types/models/appeal.model').Appeal['resource_preview']>
}) {
    if (preview.type === 'post') {
        return (
            <div className='flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3'>
                {preview.thumbnail_url ? (
                    <div className='relative h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100'>
                        <Image src={preview.thumbnail_url} alt='Post' fill className='object-cover' unoptimized />
                    </div>
                ) : (
                    <div className='flex h-14 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100'>
                        <FileText className='h-4 w-4 text-slate-400' />
                    </div>
                )}
                <div className='min-w-0 flex-1'>
                    <p className='text-xs font-medium text-slate-500 mb-0.5'>Related post</p>
                    <p className='text-sm text-slate-800 line-clamp-2'>{preview.content || '—'}</p>
                    {preview.author && <p className='text-xs text-slate-400 mt-1'>@{preview.author.username}</p>}
                </div>
            </div>
        )
    }

    if (preview.type === 'comment') {
        return (
            <div className='flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100'>
                    <MessageCircle className='h-4 w-4 text-slate-400' />
                </div>
                <div className='min-w-0 flex-1'>
                    <p className='text-xs font-medium text-slate-500 mb-0.5'>Related comment</p>
                    <p className='text-sm text-slate-800 line-clamp-2'>{preview.content || '—'}</p>
                    {preview.author && <p className='text-xs text-slate-400 mt-1'>@{preview.author.username}</p>}
                </div>
            </div>
        )
    }

    if (preview.type === 'user') {
        return (
            <div className='flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3'>
                <Avatar className='h-10 w-10 shrink-0'>
                    <AvatarImage src={preview.avatar ?? undefined} />
                    <AvatarFallback>
                        <User className='h-4 w-4' />
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className='text-xs font-medium text-slate-500'>Your account</p>
                    <p className='text-sm font-medium text-slate-800'>@{preview.username}</p>
                </div>
            </div>
        )
    }

    return null
}

function ExistingPendingAppealCard({ appeal }: { appeal: Appeal }) {
    const t = useTranslations('AppealPage')
    const tStatuses = useTranslations('AppealPage.statuses')
    const tTypes = useTranslations('AppealPage.types')

    const statusConfig: Record<string, { badge: string; icon: string }> = {
        [APPEAL_STATUSES.PENDING]: {
            badge: 'bg-amber-50 text-amber-700 border-amber-200',
            icon: 'bg-amber-100 text-amber-600'
        },
        [APPEAL_STATUSES.APPROVED]: {
            badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            icon: 'bg-emerald-100 text-emerald-600'
        },
        [APPEAL_STATUSES.REJECTED]: {
            badge: 'bg-red-50 text-red-700 border-red-200',
            icon: 'bg-red-100 text-red-600'
        }
    }
    const conf = statusConfig[appeal.status] ?? statusConfig[APPEAL_STATUSES.PENDING]

    return (
        <div className={'w-full rounded-3xl border p-8 shadow-sm md:p-10 '}>
            <div className='flex flex-col gap-6'>
                <div className='flex items-center gap-3'>
                    <div className={`rounded-full p-3 ${conf?.icon}`}>
                        <Clock className='h-6 w-6' />
                    </div>
                    <div>
                        <h1 className='text-xl font-bold text-slate-900'>{t('existing.title')}</h1>
                        <p className='text-sm text-slate-500'>{t('existing.description')}</p>
                    </div>
                </div>

                <div className='rounded-2xl bg-white/60 p-4 space-y-3'>
                    <div className='grid grid-cols-2 gap-3 text-sm'>
                        <div>
                            <span className='text-slate-500'>{t('form.appealType')}</span>
                            <p className='font-medium text-slate-900 mt-0.5'>{tTypes(appeal.appeal_type as never)}</p>
                        </div>
                        <div>
                            <span className='text-slate-500'>{t('form.resourceType')}</span>
                            <p className='font-medium text-slate-900 mt-0.5'>{appeal.resource_type}</p>
                        </div>
                        <div>
                            <span className='text-slate-500'>{t('existing.submittedAt')}</span>
                            <p className='font-medium text-slate-900 mt-0.5'>{formatDateTime(appeal.created_at)}</p>
                        </div>
                        <div className='flex flex-col'>
                            <span className='text-slate-500'>{t('form.status')}</span>
                            <div className='mt-0.5'>
                                <Badge variant='outline' className={conf?.badge}>
                                    {tStatuses(appeal.status as never)}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    {appeal.resource_preview && <ResourcePreviewInline preview={appeal.resource_preview} />}
                </div>

                {appeal.reason && (
                    <div>
                        <p className='text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5'>
                            {t('existing.yourReason')}
                        </p>
                        <p className='text-sm text-slate-700 rounded-xl bg-white/60 p-3 border border-slate-100 leading-relaxed'>
                            {appeal.reason}
                        </p>
                    </div>
                )}

                {appeal.admin_response && (
                    <div>
                        <p className='text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5'>
                            {t('existing.adminResponse')}
                        </p>
                        <p className='text-sm text-slate-700 rounded-xl bg-white/60 p-3 border border-slate-100 leading-relaxed'>
                            {appeal.admin_response}
                        </p>
                    </div>
                )}

                <div className='flex flex-col gap-2 pt-2'>
                    {appeal.uuid && appeal.status === APPEAL_STATUSES.PENDING && (
                        <Link
                            href={`${APP_ROUTES.APPEAL}?appeal_uuid=${appeal.uuid}`}
                            className='inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800'
                        >
                            <Edit2 className='h-4 w-4' />
                            {t('existing.editAppeal')}
                        </Link>
                    )}
                    <Link
                        href={APP_ROUTES.HOME}
                        className='inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/60 px-6 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50'
                    >
                        <ArrowLeft className='h-4 w-4' />
                        {t('existing.goBack')}
                    </Link>
                </div>
            </div>
        </div>
    )
}

export function AppealFormClient({ appealUuid, appealType, resourceType, resourceUuid }: AppealFormClientProps) {
    const t = useTranslations('AppealPage')
    const tTypes = useTranslations('AppealPage.types')
    const tStatuses = useTranslations('AppealPage.statuses')
    const { authStatus, hasSession } = useAppContext()
    const storeAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
    const isAuthenticated = hasSession || storeAuthenticated

    const isEditFlow = !!appealUuid
    const isNewFlow = !appealUuid && !!appealType

    const [reason, setReason] = useState('')
    const [evidenceFiles, setEvidenceFiles] = useState<File[]>([])
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [pendingAppealUuid, setPendingAppealUuid] = useState<string | null>(null)
    const [createdAppealUuid, setCreatedAppealUuid] = useState<string | null>(null)

    const {
        data: appealData,
        isLoading: isFetchingAppeal,
        isError: isFetchError,
        error: fetchError
    } = useGetAppealQuery({ uuid: appealUuid ?? '' }, { skip: !appealUuid })

    const existingAppealInfo = appealData?.data

    const { data: resourcePreviewData, isLoading: isLoadingPreview } = useGetResourcePreviewQuery(
        { resourceType: resourceType ?? '', resourceUuid },
        { skip: !isNewFlow || !resourceType }
    )

    const newFlowPreview = resourcePreviewData?.data ?? null

    const shouldCheckPending = isNewFlow && isAuthenticated
    const { data: pendingAppealsData, isLoading: isCheckingPending } = useGetMyAppealsQuery(
        { appeal_status: APPEAL_STATUSES.PENDING, appeal_type: appealType as AppealType, per_page: 20 },
        { skip: !shouldCheckPending || !appealType }
    )

    const existingPendingAppeal = useMemo<Appeal | null>(() => {
        if (!shouldCheckPending || !pendingAppealsData?.data?.length) return null
        const appeals = pendingAppealsData.data
        if (!resourceUuid) return appeals.find((a) => a.resource_type === resourceType) ?? null
        return appeals.find((a) => a.resource_preview?.uuid === resourceUuid) ?? null
    }, [shouldCheckPending, pendingAppealsData, resourceUuid, resourceType])

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
            if (resourceUuid) {
                formData.append('resource_uuid', resourceUuid)
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
                const result = await createAppeal(formData).unwrap()
                setCreatedAppealUuid(result.data.uuid ?? null)
            }
            setIsSubmitted(true)
        } catch (error) {
            const errData = (error as { data?: { message?: string; errors?: Record<string, unknown> } })?.data
            const existingUuid = errData?.errors?.existing_appeal_uuid
            if (typeof existingUuid === 'string') {
                setPendingAppealUuid(existingUuid)
                return
            }
            toast.error(errData?.message || t('form.submitError'))
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
        resourceUuid,
        isEditFlow,
        updateAppeal
    ])

    const isInvalidFlow = !isNewFlow && !isEditFlow

    if (pendingAppealUuid) {
        return (
            <div className='w-full rounded-3xl border border-amber-200 bg-amber-50 p-8 shadow-sm md:p-10'>
                <div className='flex flex-col items-center text-center gap-4'>
                    <div className='rounded-full bg-amber-100 p-4'>
                        <AlertTriangle className='h-8 w-8 text-amber-600' />
                    </div>
                    <h1 className='text-xl font-bold text-amber-900'>{t('pending.title')}</h1>
                    <p className='text-amber-700 max-w-md text-sm'>{t('pending.description')}</p>
                    <Link
                        href={`${APP_ROUTES.APPEAL}?appeal_uuid=${pendingAppealUuid}`}
                        className='inline-flex items-center gap-2 rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700'
                    >
                        {t('pending.viewAppeal')}
                    </Link>
                </div>
            </div>
        )
    }

    if (authStatus === AuthStatus.LOADING) {
        return (
            <div className='w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10'>
                <div className='flex flex-col items-center justify-center gap-2 py-8'>
                    <LoadingIcon loop className='size-20' />
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        const redirectUrl = isNewFlow
            ? `${APP_ROUTES.APPEAL}?appeal_type=${appealType}&resource_type=${resourceType}${resourceUuid ? `&resource_uuid=${resourceUuid}` : ''}`
            : isEditFlow
              ? `${APP_ROUTES.APPEAL}?appeal_uuid=${appealUuid}`
              : APP_ROUTES.APPEAL
        return (
            <div className='w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10'>
                <div className='flex flex-col items-center text-center gap-4'>
                    <div className='rounded-full bg-amber-50 p-4'>
                        <LogIn className='h-8 w-8 text-amber-600' />
                    </div>
                    <h1 className='text-2xl font-bold text-slate-900'>{t('auth.loginRequired')}</h1>
                    <p className='text-slate-600 max-w-md'>{t('auth.loginDescription')}</p>
                    <Link
                        href={`${AUTH_ROUTES.LOGIN}?redirect=${encodeURIComponent(redirectUrl)}`}
                        className='inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800'
                    >
                        <LogIn className='h-4 w-4' />
                        {t('auth.loginAction')}
                    </Link>
                </div>
            </div>
        )
    }

    if (isInvalidFlow) {
        return (
            <div className='w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10'>
                <div className='flex flex-col items-center text-center gap-4'>
                    <div className='rounded-full bg-amber-50 p-4'>
                        <AlertTriangle className='h-8 w-8 text-amber-600' />
                    </div>
                    <h1 className='text-2xl font-bold text-slate-900'>{t('error.missingTitle')}</h1>
                    <p className='text-slate-600 max-w-md'>{t('error.missingDescription')}</p>
                </div>
            </div>
        )
    }

    if (isFetchError) {
        const err = fetchError as { data?: { message?: string } }
        const errorMessage = err?.data?.message || t('error.invalidGeneric')
        return (
            <div className='w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10'>
                <div className='flex flex-col items-center text-center gap-4'>
                    <div className='rounded-full bg-red-50 p-4'>
                        <AlertTriangle className='h-8 w-8 text-red-600' />
                    </div>
                    <h1 className='text-2xl font-bold text-slate-900'>{t('error.invalidTitle')}</h1>
                    <p className='text-slate-600 max-w-md'>{errorMessage}</p>
                </div>
            </div>
        )
    }

    if (isFetchingAppeal) {
        return (
            <div className='w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10'>
                <div className='flex flex-col items-center justify-center gap-2 py-8'>
                    <LoadingIcon loop className='size-20' />
                    <p className='text-slate-500 text-sm'>{t('error.loading')}</p>
                </div>
            </div>
        )
    }

    if (isCheckingPending) {
        return (
            <div className='w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10'>
                <div className='flex flex-col items-center justify-center gap-2 py-8'>
                    <LoadingIcon loop className='size-20' />
                </div>
            </div>
        )
    }

    if (existingPendingAppeal) {
        return <ExistingPendingAppealCard appeal={existingPendingAppeal} />
    }

    if (isSubmitted) {
        return (
            <div className='w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10'>
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
                        <h2 className='text-xl font-bold text-slate-900'>{t('success.title')}</h2>
                        <p className='text-slate-600 max-w-sm'>{t('success.description')}</p>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className='text-xs text-slate-400 mt-2'
                    >
                        {t('success.notice')}
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className='flex flex-col items-center gap-2 pt-2'
                    >
                        {(createdAppealUuid ?? (isEditFlow ? appealUuid : null)) && (
                            <Link
                                href={`${APP_ROUTES.APPEAL}?appeal_uuid=${createdAppealUuid ?? appealUuid}`}
                                className='inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800'
                            >
                                {t('success.viewAppeal')}
                            </Link>
                        )}
                        <Link
                            href={APP_ROUTES.HOME}
                            className='inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-2 text-sm text-slate-500 transition hover:bg-slate-50'
                        >
                            <ArrowLeft className='h-3.5 w-3.5' />
                            {t('success.goBack')}
                        </Link>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <div className='w-full max-w-[1200px] mx-auto py-8 md:py-16 px-4 sm:px-6'>
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24'>
                
                {/* Left Column: Context & Guidelines */}
                <div className='lg:col-span-5 order-2 lg:order-1'>
                    <div className='sticky top-24'>
                        <div className='inline-flex self-start rounded-2xl bg-primary/10 p-4 mb-6 text-primary'>
                            <Scale className='h-8 w-8' />
                        </div>
                        <h1 className='text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl mb-4'>
                            {t('title')}
                        </h1>
                        <p className='text-base text-muted-foreground leading-relaxed mb-10'>
                            {t('description')}
                        </p>

                        <div className='flex flex-col gap-8'>
                            <div className='flex gap-4'>
                                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground font-semibold ring-4 ring-background'>1</div>
                                <div className='pt-2'>
                                    <h3 className='font-semibold text-foreground'>Submit Request</h3>
                                    <p className='text-sm text-muted-foreground mt-1 leading-relaxed'>Provide a clear, detailed explanation and attach any relevant evidence.</p>
                                </div>
                            </div>
                            <div className='flex gap-4'>
                                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground font-semibold ring-4 ring-background'>2</div>
                                <div className='pt-2'>
                                    <h3 className='font-semibold text-foreground'>Under Review</h3>
                                    <p className='text-sm text-muted-foreground mt-1 leading-relaxed'>Our moderation team will carefully evaluate your case against our guidelines.</p>
                                </div>
                            </div>
                            <div className='flex gap-4'>
                                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground font-semibold ring-4 ring-background'>3</div>
                                <div className='pt-2'>
                                    <h3 className='font-semibold text-foreground'>Final Decision</h3>
                                    <p className='text-sm text-muted-foreground mt-1 leading-relaxed'>You will receive a notification with the outcome. Decisions are final.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: The Form */}
                <div className='lg:col-span-7 order-1 lg:order-2'>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
                        className='w-full rounded-3xl bg-card p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/5 sm:p-10'
                    >
                        <div className='space-y-10'>
                            {appealInfo && (
                                <div className='grid gap-6'>
                                    <div className='grid grid-cols-2 gap-6 text-sm pb-5 border-b border-border/40'>
                                        <div className='space-y-1.5'>
                                            <span className='text-[11px] font-semibold text-muted-foreground uppercase tracking-wider'>{t('form.appealType')}</span>
                                            <p className='font-medium text-foreground text-base'>
                                                {appealInfo.appeal_type ? tTypes(appealInfo.appeal_type as never) : '—'}
                                            </p>
                                        </div>
                                        <div className='space-y-1.5'>
                                            <span className='text-[11px] font-semibold text-muted-foreground uppercase tracking-wider'>{t('form.resourceType')}</span>
                                            <p className='font-medium text-foreground text-base capitalize'>{appealInfo.resource_type}</p>
                                        </div>
                                        {isEditFlow && (
                                            <div className='col-span-2 flex flex-col gap-1.5 pt-2'>
                                                <span className='text-[11px] font-semibold text-muted-foreground uppercase tracking-wider'>{t('form.status')}</span>
                                                <div>
                                                    <Badge
                                                        variant='outline'
                                                        className={
                                                            appealInfo.status === APPEAL_STATUSES.APPROVED
                                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                                : appealInfo.status === APPEAL_STATUSES.REJECTED
                                                                  ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                                                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                                        }
                                                    >
                                                        {appealInfo.status ? tStatuses(appealInfo.status as never) : '—'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {isEditFlow && existingAppealInfo?.resource_preview && (
                                        <ResourcePreviewInline preview={existingAppealInfo.resource_preview} />
                                    )}

                                    {isNewFlow &&
                                        (isLoadingPreview ? (
                                            <div className='h-24 animate-pulse rounded-2xl bg-muted/50' />
                                        ) : newFlowPreview ? (
                                            <ResourcePreviewInline preview={newFlowPreview} />
                                        ) : null)}
                                </div>
                            )}

                            <div className='space-y-3'>
                                <label htmlFor='appeal-reason' className='text-sm font-semibold text-foreground flex items-center justify-between'>
                                    <span>{t('form.reasonLabel')} <span className='text-red-500'>*</span></span>
                                    <span className={`text-[11px] font-medium tracking-wide uppercase ${reason.trim().length < 20 ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {reason.trim().length} / 1000
                                    </span>
                                </label>
                                <Textarea
                                    id='appeal-reason'
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder={t('form.reasonPlaceholder')}
                                    className='min-h-[160px] resize-none rounded-2xl border-0 bg-muted/40 p-5 text-[15px] leading-relaxed transition-all focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-primary shadow-inner placeholder:text-muted-foreground/60'
                                />
                                <div className='flex justify-end text-xs'>
                                    <span className='text-muted-foreground font-medium'>{t('form.reasonHint')}</span>
                                </div>
                            </div>

                            <div className='space-y-3'>
                                <div>
                                    <h3 className='text-sm font-semibold text-foreground'>{t('form.evidenceLabel')}</h3>
                                    <p className='text-xs text-muted-foreground mt-1'>{t('form.evidenceHint')}</p>
                                </div>
                                <EvidenceDropzone files={evidenceFiles} onFilesChange={setEvidenceFiles} />
                            </div>

                            <div className='pt-6 border-t border-border/40'>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!canSubmit || isSubmitting}
                                    className='w-full rounded-full px-8 py-6 text-base font-semibold shadow-sm transition-all hover:scale-[0.98] active:scale-95'
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                                            {t('form.submitting')}
                                        </>
                                    ) : (
                                        <>
                                            <Send className='mr-2 h-5 w-5' />
                                            {t('form.submit')}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
