'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { CalendarClock, X, Info } from 'lucide-react'
import UploadVideo from '@/app/[locale]/(user)/snapistudio/upload/_components/upload-video'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import VideoPreview from '@/app/[locale]/(user)/snapistudio/upload/_components/video-preview'
import SelectThumbnailDialog from '@/app/[locale]/(user)/snapistudio/upload/_components/select-thumbnail-dialog'
import AudienceSelect from '@/components/forms/audience-select'
import AlertDialogExitPage from '@/app/[locale]/(user)/snapistudio/upload/_components/alert-confirm-leave-page'
import MentionHashtagTextField from '@/components/forms/mention-hashtag-text-field'
import { useUploadFormManager } from '@/app/[locale]/(user)/snapistudio/upload/_hooks/useUploadFormManager'
import { useAiCopilotContext } from '@/app/[locale]/(user)/snapistudio/_components/ai-copilot/AiCopilotContext'
import { AiVideoAttachments } from '@/app/[locale]/(user)/snapistudio/_components/ai-copilot/attachments/AiVideoAttachments'

export default function FormUploadVideo() {
    const t = useTranslations('SnapiStudio.upload')
    const [scheduledAt, setScheduledAtLocal] = useState('')
    const [showSchedule, setShowSchedule] = useState(false)
    const [previewSeekTo, setPreviewSeekTo] = useState<{ time: number; key: number } | null>(null)

    const handleTimelineSeek = useCallback((time: number) => {
        setPreviewSeekTo({ time, key: Date.now() })
    }, [])
    const { setVideoContext, registerFormPatch, unregisterFormPatch } = useAiCopilotContext()

    const {
        form,
        isInitialRender,
        setIsInitialRender,
        videoFile,
        setVideoFile,
        setThumbnailFile,
        videoUrl,
        thumbnailUrl,
        videoFrames,
        uploadStatus,
        uploadProgress,
        sessionUuid,
        uploadError,
        retryUpload,
        videoStatus,
        isSubmitLoading,
        isOpenModalConfirmExit,
        stayHere,
        leavePage,
        onReset,
        onSubmit,
        setScheduledAt
    } = useUploadFormManager()

    const isUploading = uploadStatus === 'uploading'
    const isSubmitDisabled = isSubmitLoading || isUploading || !sessionUuid

    const content = form.watch('content')

    // Sync form content to AI Copilot context
    useEffect(() => {
        setVideoContext({
            video_description:    content ?? '',
            upload_session_uuid:  sessionUuid ?? undefined,
        })
    }, [content, sessionUuid, setVideoContext])

    // Register form field patch callbacks for Accept flow
    useEffect(() => {
        registerFormPatch('content', (val) =>
            form.setValue('content', val, { shouldDirty: true, shouldValidate: true }),
        )
        registerFormPatch('title', (val) =>
            form.setValue('content', val, { shouldDirty: true, shouldValidate: true }),
        )
        return () => {
            unregisterFormPatch('content')
            unregisterFormPatch('title')
        }
    }, [form, registerFormPatch, unregisterFormPatch])

    const handleScheduleChange = (value: string) => {
        setScheduledAtLocal(value)
        setScheduledAt(value ? new Date(value).toISOString() : null)
    }

    const handleClearSchedule = () => {
        setScheduledAtLocal('')
        setScheduledAt(null)
        setShowSchedule(false)
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} onReset={onReset} method='POST'>
                    <AlertDialogExitPage isOpen={isOpenModalConfirmExit} onCancel={stayHere} onConfirm={leavePage} />

                    {isInitialRender ? (
                        <UploadVideo
                            onFileSelect={setVideoFile}
                            file={videoFile}
                            isUploading={isUploading}
                            uploadProgress={uploadProgress}
                            uploadError={uploadError}
                            onRetryUpload={retryUpload}
                            videoStatus={videoStatus}
                            onReset={onReset}
                            setIsInitialRender={setIsInitialRender}
                            isInitialRender={isInitialRender}
                        />
                    ) : (
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]'>
                            {/* Left column */}
                            <div className='space-y-5 min-w-0'>
                                <UploadVideo
                                    onFileSelect={setVideoFile}
                                    file={videoFile}
                                    isUploading={isUploading}
                                    uploadProgress={uploadProgress}
                                    uploadError={uploadError}
                                    onRetryUpload={retryUpload}
                                    videoStatus={videoStatus}
                                    onReset={onReset}
                                    setIsInitialRender={setIsInitialRender}
                                    isInitialRender={isInitialRender}
                                />

                                {/* AI: Video timeline analysis */}
                                <AiVideoAttachments videoUrl={videoUrl ?? null} onSeek={handleTimelineSeek} />

                                {/* Details card */}
                                <section className='rounded-xl border border-border bg-card shadow-sm'>
                                    <div className='border-b border-border px-5 py-4'>
                                        <h2 className='font-semibold'>{t('detail.title')}</h2>
                                    </div>
                                    <div className='px-5 py-5 space-y-6'>
                                        {/* Description */}
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
                                                            className='resize-none bg-muted/40'
                                                            rows={6}
                                                            placeholder={t('detail.description.placeholder')}
                                                            value={field.value ?? ''}
                                                            onChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <FormDescription className='text-right'>
                                                        {content?.length ?? 0}/4000
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Cover */}
                                        <div>
                                            <div className='mb-3 flex items-center gap-1.5'>
                                                <span className='text-sm font-semibold'>{t('detail.cover.label')}</span>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info size={13} className='text-muted-foreground cursor-help' />
                                                    </TooltipTrigger>
                                                    <TooltipContent align='start' className='w-64'>
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
                                    </div>
                                </section>

                                {/* Settings card */}
                                <section className='rounded-xl border border-border bg-card shadow-sm'>
                                    <div className='border-b border-border px-5 py-4'>
                                        <h2 className='font-semibold'>{t('settings.title')}</h2>
                                    </div>
                                    <div className='px-5 py-5'>
                                        <FormField
                                            control={form.control}
                                            name='audience'
                                            render={({ field }) => (
                                                <FormItem className='max-w-[280px]'>
                                                    <FormLabel className='text-sm font-semibold'>
                                                        {t('settings.audience.label')}
                                                    </FormLabel>
                                                    <AudienceSelect
                                                        value={field.value.toString()}
                                                        onValueChange={(value) => field.onChange(Number(value))}
                                                        placeholder={t('settings.audience.placeholder')}
                                                    />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </section>

                                {/* Schedule picker */}
                                {showSchedule && (
                                    <div className='rounded-xl border border-border bg-card p-4 space-y-3'>
                                        <div className='flex items-center justify-between'>
                                            <div className='flex items-center gap-2'>
                                                <CalendarClock size={15} className='text-primary' />
                                                <span className='text-sm font-medium'>Hẹn giờ đăng bài</span>
                                            </div>
                                            <button
                                                type='button'
                                                onClick={handleClearSchedule}
                                                className='text-muted-foreground hover:text-foreground'
                                            >
                                                <X size={15} />
                                            </button>
                                        </div>
                                        <input
                                            type='datetime-local'
                                            value={scheduledAt}
                                            min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
                                            onChange={e => handleScheduleChange(e.target.value)}
                                            className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/50'
                                        />
                                        {scheduledAt && (
                                            <p className='text-xs text-muted-foreground'>
                                                Bài sẽ được đăng lúc{' '}
                                                <strong>
                                                    {new Date(scheduledAt).toLocaleString('vi-VN', {
                                                        dateStyle: 'short',
                                                        timeStyle: 'short'
                                                    })}
                                                </strong>
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className='flex flex-wrap gap-3 pb-6'>
                                    <Button
                                        size='lg'
                                        variant='brand'
                                        type='submit'
                                        isLoading={isSubmitLoading}
                                        disabled={isSubmitDisabled || (showSchedule && !scheduledAt)}
                                        className='w-44'
                                    >
                                        {showSchedule && scheduledAt ? (
                                            <><CalendarClock size={15} /> Hẹn giờ đăng</>
                                        ) : (
                                            t('buttons.post')
                                        )}
                                    </Button>
                                    {!showSchedule && (
                                        <Button
                                            size='lg'
                                            variant='outline'
                                            type='button'
                                            className='gap-2'
                                            onClick={() => setShowSchedule(true)}
                                            disabled={isSubmitDisabled}
                                        >
                                            <CalendarClock size={15} />
                                            Hẹn giờ
                                        </Button>
                                    )}
                                    <Button
                                        size='lg'
                                        variant='outline'
                                        type='reset'
                                        className='w-36'
                                        onClick={onReset}
                                        disabled={isSubmitLoading || isUploading}
                                    >
                                        {t('buttons.discard')}
                                    </Button>
                                </div>
                            </div>

                            {/* Right column — sticky preview */}
                            <div className='hidden lg:block'>
                                <div className='sticky top-6'>
                                    <p className='mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
                                        {t('preview')}
                                    </p>
                                    <VideoPreview content={content ?? ''} videoSrc={videoUrl} seekTo={previewSeekTo} />
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </Form>

        </>
    )
}
