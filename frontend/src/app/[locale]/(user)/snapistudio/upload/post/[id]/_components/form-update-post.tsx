'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { UpdatePostReqBody, UpdatePostReqBodyType } from '@/types/dtos/post/post-request.dto'
import { zodResolver } from '@hookform/resolvers/zod'
import { Audience, AUDIENCE_VALUES } from '@/constants/enum'
import { CalendarClock, Info, X } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import VideoPreview from '@/app/[locale]/(user)/snapistudio/upload/_components/video-preview'
import SelectThumbnailDialog from '@/app/[locale]/(user)/snapistudio/upload/_components/select-thumbnail-dialog'
import AudienceSelect from '@/components/forms/audience-select'

import { useUploadImageMutation } from '@/store/services/content/upload.service'
import { useGetPostDetailQuery, useUpdatePostMutation } from '@/store/services/content/posts.service'
import { useCancelScheduleMutation, useReschedulePostMutation, useSchedulePostMutation } from '@/store/services/content/studio-post-schedule.service'
import { handleFormError } from '@/utils/errors/handle-form-errors.util'
import { SearchParamsLoader, useSearchParamsLoader } from '@/components/common/search-params-loader'
import { useRouter } from '@/i18n/navigation'
import { useParams } from 'next/navigation'
import useVideoFrames from '@/hooks/video/useVideoFrames'
import LoadingIcon from '@/components/lottie-icons/loading'
import useCurrentUserData from '@/hooks/data/useCurrentUserData'
import { useConfirmNavigation } from '@/hooks/shared/useConfirmNavigation'
import AlertDialogExitPage from '@/app/[locale]/(user)/snapistudio/upload/_components/alert-confirm-leave-page'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { extractHashtags } from '@/utils/social-token.util'
import MentionHashtagTextField from '@/components/forms/mention-hashtag-text-field'
import { logger } from '@/utils/logger.util'
import { SNAPISTUDIO_ROUTES } from '@/constants/routes/routes'
import { APP_TIMEZONE } from '@/constants/studio-post'
import { useAiCopilotContext } from '@/components/ai-copilot/AiCopilotContext'
import { AiVideoAttachments } from '@/components/ai-copilot/attachments/AiVideoAttachments'

const UPDATE_POST_AUDIENCE_VALUES = new Set(AUDIENCE_VALUES)

function toUpdatePostAudience(value: number | null | undefined): UpdatePostReqBodyType['audience'] {
    if (value != null && UPDATE_POST_AUDIENCE_VALUES.has(value as (typeof AUDIENCE_VALUES)[number])) {
        return value as UpdatePostReqBodyType['audience']
    }

    return Audience.PUBLIC
}

export default function FormUpdatePost() {
    const t = useTranslations('SnapiStudio.upload')
    const { id } = useParams<{ id: string }>() ?? { id: '' }
    const { setVideoContext, registerFormPatch, unregisterFormPatch } = useAiCopilotContext()
    const [uploadImageMutate, uploadImageResult] = useUploadImageMutation()
    const [updatePostMutate, updatePostResult] = useUpdatePostMutation()
    const [schedulePost, schedulePostResult] = useSchedulePostMutation()
    const [reschedulePost, reschedulePostResult] = useReschedulePostMutation()
    const [cancelSchedule, cancelScheduleResult] = useCancelScheduleMutation()
    const { searchParams, setSearchParams } = useSearchParamsLoader()
    const currentUser = useCurrentUserData()
    const redirectFrom = searchParams?.get('from')
    const router = useRouter()

    const { data, isLoading, error } = useGetPostDetailQuery(id, { skip: !id })
    const post = data?.data
    const {
        showModal: isOpenModalConfirmExit,
        stayHere,
        leavePage
    } = useConfirmNavigation({
        shouldConfirm: post !== undefined
    })

    const form = useForm<UpdatePostReqBodyType>({
        resolver: zodResolver(UpdatePostReqBody),
        defaultValues: {
            audience: Audience.PUBLIC,
            content: '',
            hashtags: [],
            mentions: [],
            thumbnail: undefined
        }
    })

    const pendingSchedule = useMemo(
        () => (post?.scheduled_post?.status === 'pending' ? post.scheduled_post : null),
        [post]
    )
    const canSchedule = post?.status === 'draft' || post?.status === 'failed' || post?.status === 'scheduled'

    const [showSchedule, setShowSchedule] = useState(false)
    const [scheduledAt, setScheduledAt] = useState('')

    useEffect(() => {
        if (pendingSchedule?.scheduled_at) {
            setScheduledAt(new Date(pendingSchedule.scheduled_at).toISOString().slice(0, 16))
            setShowSchedule(true)
        }
    }, [pendingSchedule])

    const [videoUrl, setVideoUrl] = useState<string | null>(null)

    const videoFrames = useVideoFrames(videoUrl, 10)

    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)

    useEffect(() => {
        if (!id) {
            router.push(SNAPISTUDIO_ROUTES.UPLOAD)
        }
    }, [id, router])

    useEffect(() => {
        if (post) {
            form.setValue('content', post.content ?? '')
            form.setValue('audience', toUpdatePostAudience(post.audience))
            form.setValue('thumbnail', post.thumbnail_file_id ?? undefined)
            form.setValue(
                'hashtags',
                Array.from(new Set((post.hashtags ?? []).map((hashtag) => hashtag.name.toLowerCase())))
            )
            form.setValue('mentions', Array.from(new Set((post.mentions ?? []).map((mention) => mention.id))))
            setVideoUrl(post.medias?.[0]?.url || null)
            setThumbnailUrl(post.thumbnail_url || null)

            // Push post context to AI Copilot
            setVideoContext({
                post_uuid: post.uuid,
                video_description: post.content ?? ''
            })
        }
    }, [post, form, setVideoContext])

    // Register form field patches for AI Copilot Accept flow
    useEffect(() => {
        registerFormPatch('content', (val) =>
            form.setValue('content', val, { shouldDirty: true, shouldValidate: true })
        )
        return () => {
            unregisterFormPatch('content')
        }
    }, [form, registerFormPatch, unregisterFormPatch])

    useEffect(() => {
        if (!thumbnailFile) {
            setThumbnailUrl(post?.thumbnail_url ?? null)
            return
        }
        const url = URL.createObjectURL(thumbnailFile)
        setThumbnailUrl(url)
        return () => URL.revokeObjectURL(url)
    }, [thumbnailFile, post])

    const onReset = () => {
        setThumbnailFile(null)
        form.reset()
    }

    const isScheduleLoading =
        schedulePostResult.isLoading || reschedulePostResult.isLoading || cancelScheduleResult.isLoading
    const isUpdatePostLoading = updatePostResult.isLoading || uploadImageResult.isLoading || isScheduleLoading

    const onSchedule = async () => {
        if (!post || !scheduledAt || isUpdatePostLoading) return
        const body = { scheduled_at: new Date(scheduledAt).toISOString(), timezone: APP_TIMEZONE }
        try {
            if (pendingSchedule) {
                await reschedulePost({ schedUuid: pendingSchedule.uuid, ...body }).unwrap()
            } else {
                await schedulePost({ postUuid: post.uuid, ...body }).unwrap()
            }
            toast.success(t('toast.scheduled'))
        } catch (error) {
            logger.error(error)
        }
    }

    const onCancelSchedule = async () => {
        if (!pendingSchedule || isUpdatePostLoading) return
        try {
            await cancelSchedule(pendingSchedule.uuid).unwrap()
            setScheduledAt('')
            setShowSchedule(false)
            toast.success(t('toast.scheduleCancelled'))
        } catch (error) {
            logger.error(error)
        }
    }

    const onsubmit = async (data: UpdatePostReqBodyType) => {
        if (isUpdatePostLoading || !post) return
        try {
            let thumbnail = data.thumbnail
            if (thumbnailFile) {
                const formdata = new FormData()
                formdata.append('file', thumbnailFile)

                const res = await uploadImageMutate(formdata).unwrap()
                thumbnail = res.data.id
            }

            const body: UpdatePostReqBodyType = {
                ...data,
                hashtags: extractHashtags(data.content ?? ''),
                mentions: undefined,
                thumbnail
            }
            const response = await updatePostMutate({ post_uuid: post.uuid, body }).unwrap()
            toast.success(response.message ?? t('toast.updated'))
        } catch (error) {
            logger.error(error)
            handleFormError<UpdatePostReqBodyType>({
                error,
                setFormError: form.setError
            })
        }
    }

    const onCancel = () => {
        if (isUpdatePostLoading) return
        if (redirectFrom) {
            router.push(redirectFrom)
        } else {
            router.push(SNAPISTUDIO_ROUTES.CONTENT)
        }
    }
    const content = form.watch('content')

    const hashPermission = currentUser?.uuid === post?.user_uuid

    if (isLoading || error || !currentUser || !hashPermission) {
        return (
            <div className='h-[calc(100vh-4.25rem)] flex items-center justify-center'>
                <LoadingIcon className='size-15 mx-auto' loop />
            </div>
        )
    }

    return (
        <Form {...form}>
            <AlertDialogExitPage isOpen={isOpenModalConfirmExit} onCancel={stayHere} onConfirm={leavePage} />
            <SearchParamsLoader onParamsReceived={setSearchParams} />
            <form onSubmit={form.handleSubmit(onsubmit)} onReset={onReset} method='POST' className='relative'>
                <div className='grid grid-cols-[70%_30%] gap-4'>
                    <div>
                        {/* AI: Timeline segment + frame picker */}
                        <div className='mt-4'>
                            <AiVideoAttachments videoUrl={videoUrl} />
                        </div>

                        <div className='mt-5 text-base font-bold'>{t('detail.title')}</div>
                        <div className='rounded-lg border border-border p-5 mt-[16px]'>
                            <FormField
                                control={form.control}
                                name='content'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-sm font-semibold'>
                                            {t('detail.description.label')}
                                        </FormLabel>
                                        <FormControl>
                                            <MentionHashtagTextField
                                                as='textarea'
                                                className='resize-none bg-accent'
                                                rows={5}
                                                placeholder={t('detail.description.placeholder')}
                                                value={field.value ?? ''}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormDescription>{content?.length ?? 0}/4000</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className='flex mt-7 mb-2 items-center gap-2 text-sm font-semibold'>
                                {t('detail.cover.label')}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info size={14} className='text-muted-foreground' />
                                    </TooltipTrigger>
                                    <TooltipContent align='center' className='w-2xs'>
                                        <p>{t('detail.cover.tooltip')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <SelectThumbnailDialog
                                setCoverImage={setThumbnailFile}
                                videoSrc={videoUrl}
                                imageSrc={thumbnailUrl}
                                videoFrames={videoFrames}
                            />
                        </div>

                        <div className='mt-5 text-base font-bold'>{t('settings.title')}</div>
                        <div className='rounded-lg border border-border p-5 mt-[16px] '>
                            <FormField
                                control={form.control}
                                name='audience'
                                render={({ field }) => (
                                    <FormItem className='w-[280px]'>
                                        <FormLabel className='text-sm font-semibold'>
                                            {t('settings.audience.label')}
                                        </FormLabel>
                                        <AudienceSelect
                                            value={(field?.value ?? Audience.PUBLIC).toString()}
                                            onValueChange={(value) => field.onChange(Number(value))}
                                            placeholder={t('settings.audience.placeholder')}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        {canSchedule && (
                            <div className='mt-5 rounded-xl border border-border bg-card p-4 space-y-3'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <CalendarClock size={15} className='text-primary' />
                                        <span className='text-sm font-medium'>{t('schedule.title')}</span>
                                    </div>
                                    {showSchedule && (
                                        <button
                                            type='button'
                                            onClick={() => { setShowSchedule(false); setScheduledAt('') }}
                                            className='text-muted-foreground hover:text-foreground'
                                        >
                                            <X size={15} />
                                        </button>
                                    )}
                                </div>
                                {showSchedule ? (
                                    <>
                                        <input
                                            type='datetime-local'
                                            value={scheduledAt}
                                            min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
                                            onChange={(e) => setScheduledAt(e.target.value)}
                                            className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/50'
                                        />
                                        {scheduledAt && (
                                            <p className='text-xs text-muted-foreground'>
                                                {t('schedule.preview', {
                                                    date: new Date(scheduledAt).toLocaleString(undefined, {
                                                        dateStyle: 'short',
                                                        timeStyle: 'short'
                                                    })
                                                })}
                                            </p>
                                        )}
                                        <div className='flex gap-2'>
                                            <Button
                                                type='button'
                                                size='sm'
                                                variant='brand'
                                                disabled={!scheduledAt || isUpdatePostLoading}
                                                isLoading={isScheduleLoading}
                                                onClick={onSchedule}
                                            >
                                                <CalendarClock size={13} />
                                                {pendingSchedule ? t('buttons.reschedule') : t('buttons.scheduleNow')}
                                            </Button>
                                            {pendingSchedule && (
                                                <Button
                                                    type='button'
                                                    size='sm'
                                                    variant='outline'
                                                    disabled={isUpdatePostLoading}
                                                    onClick={onCancelSchedule}
                                                >
                                                    {t('buttons.cancelSchedule')}
                                                </Button>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <Button
                                        type='button'
                                        size='sm'
                                        variant='outline'
                                        className='gap-2'
                                        onClick={() => setShowSchedule(true)}
                                    >
                                        <CalendarClock size={13} />
                                        {t('buttons.schedule')}
                                    </Button>
                                )}
                            </div>
                        )}

                        <div className='flex gap-4 mt-10'>
                            <Button
                                size='lg'
                                variant='brand'
                                type='submit'
                                isLoading={isUpdatePostLoading}
                                className='w-[200px]'
                            >
                                {t('buttons.update')}
                            </Button>
                            <Button
                                size='lg'
                                variant={'secondary'}
                                type='button'
                                className='cursor-pointer w-[200px]'
                                onClick={onCancel}
                                disabled={isUpdatePostLoading}
                            >
                                {t('buttons.cancel')}
                            </Button>
                        </div>
                    </div>
                    <VideoPreview content={content ?? ''} videoSrc={videoUrl} className='mt-5 mx-auto' />
                </div>
            </form>
        </Form>
    )
}
