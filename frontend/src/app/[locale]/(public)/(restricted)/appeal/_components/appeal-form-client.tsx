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
    MessageCircle,
    ShieldCheck,
    ClipboardList,
    Bell
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
} from '@/store/services/user/appeal.service'
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
            <div className='flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 shadow-sm'>
                {preview.thumbnail_url ? (
                    <div className='relative h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 shadow-sm'>
                        <Image src={preview.thumbnail_url} alt='Post' fill className='object-cover' unoptimized />
                    </div>
                ) : (
                    <div className='flex h-14 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100'>
                        <FileText className='h-4 w-4 text-slate-400' />
                    </div>
                )}
                <div className='min-w-0 flex-1'>
                    <p className='text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5'>Bài viết liên quan</p>
                    <p className='text-sm text-slate-800 line-clamp-2 leading-snug'>{preview.content || '—'}</p>
                    {preview.author && <p className='text-xs text-slate-400 mt-1'>@{preview.author.username}</p>}
                </div>
            </div>
        )
    }

    if (preview.type === 'comment') {
        return (
            <div className='flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 shadow-sm'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100'>
                    <MessageCircle className='h-4 w-4 text-slate-400' />
                </div>
                <div className='min-w-0 flex-1'>
                    <p className='text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5'>Bình luận liên quan</p>
                    <p className='text-sm text-slate-800 line-clamp-2 leading-snug'>{preview.content || '—'}</p>
                    {preview.author && <p className='text-xs text-slate-400 mt-1'>@{preview.author.username}</p>}
                </div>
            </div>
        )
    }

    if (preview.type === 'user') {
        return (
            <div className='flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 shadow-sm'>
                <Avatar className='h-10 w-10 shrink-0 ring-2 ring-slate-100'>
                    <AvatarImage src={preview.avatar ?? undefined} />
                    <AvatarFallback>
                        <User className='h-4 w-4' />
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className='text-[10px] font-semibold text-slate-400 uppercase tracking-wider'>Tài khoản của bạn</p>
                    <p className='text-sm font-semibold text-slate-800'>@{preview.username}</p>
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

    const statusConfig: Record<string, { badge: string; icon: string; ring: string }> = {
        [APPEAL_STATUSES.PENDING]: {
            badge: 'bg-amber-50 text-amber-700 border-amber-200',
            icon: 'bg-amber-100 text-amber-600',
            ring: 'ring-amber-100'
        },
        [APPEAL_STATUSES.APPROVED]: {
            badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            icon: 'bg-emerald-100 text-emerald-600',
            ring: 'ring-emerald-100'
        },
        [APPEAL_STATUSES.REJECTED]: {
            badge: 'bg-red-50 text-red-700 border-red-200',
            icon: 'bg-red-100 text-red-600',
            ring: 'ring-red-100'
        }
    }
    const conf = statusConfig[appeal.status] ?? statusConfig[APPEAL_STATUSES.PENDING]

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
                    {appeal.resource_preview && <ResourcePreviewInline preview={appeal.resource_preview} />}
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

    // ── State screens ──────────────────────────────────────────────────────────

    const cardBase =
        'w-full rounded-3xl border border-slate-200/80 bg-white p-8 shadow-lg shadow-slate-200/60 md:p-10'

    if (pendingAppealUuid) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className='w-full rounded-3xl border border-amber-200 bg-amber-50/60 p-8 shadow-lg shadow-amber-100/60 md:p-10'
            >
                <div className='flex flex-col items-center text-center gap-5'>
                    <div className='rounded-2xl bg-amber-100 p-4 ring-8 ring-amber-50'>
                        <AlertTriangle className='h-8 w-8 text-amber-600' />
                    </div>
                    <div className='space-y-1.5'>
                        <h1 className='text-xl font-bold text-amber-900 tracking-tight'>{t('pending.title')}</h1>
                        <p className='text-amber-700 max-w-md text-sm leading-relaxed'>{t('pending.description')}</p>
                    </div>
                    <Link
                        href={`${APP_ROUTES.APPEAL}?appeal_uuid=${pendingAppealUuid}`}
                        className='inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-amber-700 hover:scale-[1.02] active:scale-[0.98] shadow-sm'
                    >
                        {t('pending.viewAppeal')}
                    </Link>
                </div>
            </motion.div>
        )
    }

    if (authStatus === AuthStatus.LOADING || isCheckingPending) {
        return (
            <div className={cardBase}>
                <div className='flex flex-col items-center justify-center gap-2 py-12'>
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
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={cardBase}
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

    if (isInvalidFlow) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={cardBase}
            >
                <div className='flex flex-col items-center text-center gap-5 py-4'>
                    <div className='rounded-2xl bg-red-50 p-4 ring-8 ring-red-50/50'>
                        <AlertTriangle className='h-8 w-8 text-red-500' />
                    </div>
                    <div className='space-y-1.5'>
                        <h1 className='text-2xl font-bold text-slate-900 tracking-tight'>{t('error.missingTitle')}</h1>
                        <p className='text-slate-500 max-w-md text-sm leading-relaxed'>{t('error.missingDescription')}</p>
                    </div>
                </div>
            </motion.div>
        )
    }

    if (isFetchError) {
        const err = fetchError as { data?: { message?: string } }
        const errorMessage = err?.data?.message || t('error.invalidGeneric')
        return (
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={cardBase}
            >
                <div className='flex flex-col items-center text-center gap-5 py-4'>
                    <div className='rounded-2xl bg-red-50 p-4 ring-8 ring-red-50/50'>
                        <AlertTriangle className='h-8 w-8 text-red-500' />
                    </div>
                    <div className='space-y-1.5'>
                        <h1 className='text-2xl font-bold text-slate-900 tracking-tight'>{t('error.invalidTitle')}</h1>
                        <p className='text-slate-500 max-w-md text-sm leading-relaxed'>{errorMessage}</p>
                    </div>
                </div>
            </motion.div>
        )
    }

    if (isFetchingAppeal) {
        return (
            <div className={cardBase}>
                <div className='flex flex-col items-center justify-center gap-3 py-12'>
                    <LoadingIcon loop className='size-20' />
                    <p className='text-slate-400 text-sm'>{t('error.loading')}</p>
                </div>
            </div>
        )
    }

    if (existingPendingAppeal) {
        return <ExistingPendingAppealCard appeal={existingPendingAppeal} />
    }

    if (isSubmitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className={`${cardBase} relative overflow-hidden`}
            >
                {/* subtle radial glow */}
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
                        {(createdAppealUuid ?? (isEditFlow ? appealUuid : null)) && (
                            <Link
                                href={`${APP_ROUTES.APPEAL}?appeal_uuid=${createdAppealUuid ?? appealUuid}`}
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

    // ── Main Form ──────────────────────────────────────────────────────────────

    const charCount = reason.trim().length
    const charProgress = Math.min(charCount / 1000, 1)

    return (
        <div className='w-full max-w-[1180px] mx-auto py-10 md:py-20 px-4 sm:px-6'>
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20'>

                {/* ── Left: Context & Steps ── */}
                <div className='lg:col-span-5 order-2 lg:order-1'>
                    <div className='sticky top-24'>
                        {/* Icon badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className='inline-flex self-start rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-4 mb-7 shadow-lg shadow-slate-300/50'
                        >
                            <Scale className='h-7 w-7 text-white' />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className='text-3xl font-bold tracking-tight text-slate-900 md:text-4xl lg:text-[2.6rem] lg:leading-tight mb-3'
                            style={{ textWrap: 'balance' } as React.CSSProperties}
                        >
                            {t('title')}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                            className='text-base text-slate-500 leading-relaxed mb-10'
                        >
                            {t('description')}
                        </motion.p>

                        {/* Steps */}
                        <div className='flex flex-col gap-0'>
                            {[
                                {
                                    icon: ClipboardList,
                                    title: 'Submit request',
                                    desc: 'Provide a clear, detailed explanation and attach any relevant evidence.',
                                    num: 1
                                },
                                {
                                    icon: ShieldCheck,
                                    title: 'Under review',
                                    desc: 'Our moderation team will carefully evaluate your case against our guidelines.',
                                    num: 2
                                },
                                {
                                    icon: Bell,
                                    title: 'Final decision',
                                    desc: 'You will receive a notification with the outcome. Decisions are final.',
                                    num: 3
                                }
                            ].map((step, i) => (
                                <motion.div
                                    key={step.num}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                                    className='flex gap-4'
                                >
                                    {/* Number + line */}
                                    <div className='flex flex-col items-center'>
                                        <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white text-sm font-bold shadow-sm'>
                                            {step.num}
                                        </div>
                                        {i < 2 && <div className='w-px flex-1 bg-slate-200 my-2' />}
                                    </div>
                                    {/* Content */}
                                    <div className={i < 2 ? 'pb-7 pt-1.5' : 'pt-1.5'}>
                                        <h3 className='font-semibold text-slate-900 text-sm'>{step.title}</h3>
                                        <p className='text-sm text-slate-500 mt-1 leading-relaxed'>{step.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Right: Form ── */}
                <div className='lg:col-span-7 order-1 lg:order-2'>
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 }}
                        className='relative w-full rounded-3xl bg-white border border-slate-200/80 shadow-xl shadow-slate-200/60 overflow-hidden'
                    >
                        {/* subtle top gradient accent */}
                        <div className='absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-400 via-slate-700 to-slate-400 opacity-60' />

                        <div className='p-7 sm:p-10 space-y-8'>

                            {/* Appeal meta */}
                            {appealInfo && (
                                <div className='space-y-5'>
                                    <div className='grid grid-cols-2 gap-5 text-sm pb-6 border-b border-slate-100'>
                                        <div className='space-y-1.5'>
                                            <span className='text-[10px] font-semibold text-slate-400 uppercase tracking-wider'>
                                                {t('form.appealType')}
                                            </span>
                                            <p className='font-semibold text-slate-800 text-base'>
                                                {appealInfo.appeal_type ? tTypes(appealInfo.appeal_type as never) : '—'}
                                            </p>
                                        </div>
                                        <div className='space-y-1.5'>
                                            <span className='text-[10px] font-semibold text-slate-400 uppercase tracking-wider'>
                                                {t('form.resourceType')}
                                            </span>
                                            <p className='font-semibold text-slate-800 text-base capitalize'>
                                                {appealInfo.resource_type}
                                            </p>
                                        </div>
                                        {isEditFlow && (
                                            <div className='col-span-2 space-y-1.5'>
                                                <span className='text-[10px] font-semibold text-slate-400 uppercase tracking-wider'>
                                                    {t('form.status')}
                                                </span>
                                                <div>
                                                    <Badge
                                                        variant='outline'
                                                        className={
                                                            appealInfo.status === APPEAL_STATUSES.APPROVED
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold'
                                                                : appealInfo.status === APPEAL_STATUSES.REJECTED
                                                                  ? 'bg-red-50 text-red-700 border-red-200 text-xs font-semibold'
                                                                  : 'bg-amber-50 text-amber-700 border-amber-200 text-xs font-semibold'
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
                                            <div className='h-20 animate-pulse rounded-2xl bg-slate-100' />
                                        ) : newFlowPreview ? (
                                            <ResourcePreviewInline preview={newFlowPreview} />
                                        ) : null)}
                                </div>
                            )}

                            {/* Reason field */}
                            <div className='space-y-3'>
                                <div className='flex items-center justify-between'>
                                    <label
                                        htmlFor='appeal-reason'
                                        className='text-sm font-semibold text-slate-800'
                                    >
                                        {t('form.reasonLabel')} <span className='text-red-400'>*</span>
                                    </label>
                                    <span
                                        className={`text-[11px] font-semibold tabular-nums transition-colors ${
                                            charCount < 20
                                                ? 'text-red-400'
                                                : charCount >= 900
                                                  ? 'text-amber-500'
                                                  : 'text-emerald-500'
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
                                    className='min-h-[160px] resize-none rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-4 text-[15px] leading-relaxed text-slate-800 placeholder:text-slate-400 transition-all focus-visible:bg-white focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-200 shadow-sm'
                                />
                                {/* Progress bar */}
                                <div className='h-1 w-full rounded-full bg-slate-100 overflow-hidden'>
                                    <motion.div
                                        className={`h-full rounded-full transition-colors ${
                                            charCount < 20
                                                ? 'bg-red-400'
                                                : charCount >= 900
                                                  ? 'bg-amber-400'
                                                  : 'bg-emerald-400'
                                        }`}
                                        animate={{ width: `${charProgress * 100}%` }}
                                        transition={{ duration: 0.2 }}
                                    />
                                </div>
                                <p className='text-xs text-slate-400'>{t('form.reasonHint')}</p>
                            </div>

                            {/* Evidence upload */}
                            <div className='space-y-3'>
                                <div>
                                    <h3 className='text-sm font-semibold text-slate-800'>{t('form.evidenceLabel')}</h3>
                                    <p className='text-xs text-slate-400 mt-0.5'>{t('form.evidenceHint')}</p>
                                </div>
                                <EvidenceDropzone files={evidenceFiles} onFilesChange={setEvidenceFiles} />
                            </div>

                            {/* Submit */}
                            <div className='pt-4 border-t border-slate-100'>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!canSubmit || isSubmitting}
                                    className='w-full rounded-2xl py-6 text-base font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-slate-300/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100'
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className='mr-2.5 h-5 w-5 animate-spin' />
                                            {t('form.submitting')}
                                        </>
                                    ) : (
                                        <>
                                            <Send className='mr-2.5 h-5 w-5' />
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
