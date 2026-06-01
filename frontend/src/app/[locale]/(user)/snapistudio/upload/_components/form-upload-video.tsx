'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import UploadVideo from '@/app/[locale]/(user)/snapistudio/upload/_components/upload-video'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import VideoPreview from '@/app/[locale]/(user)/snapistudio/upload/_components/video-preview'
import SelectThumbnailDialog from '@/app/[locale]/(user)/snapistudio/upload/_components/select-thumbnail-dialog'
import AudienceSelect from '@/components/forms/audience-select'
import AlertDialogExitPage from '@/app/[locale]/(user)/snapistudio/upload/_components/alert-confirm-leave-page'
import MentionHashtagTextField from '@/components/forms/mention-hashtag-text-field'
import { useUploadFormManager } from '@/app/[locale]/(user)/snapistudio/upload/_hooks/useUploadFormManager'
import { AiFloatingChat } from '@/app/[locale]/(user)/snapistudio/upload/_components/ai-floating-chat/AiFloatingChat'
import { AiContentSuggestionType } from '@/types/models/ai-content-suggestion.model'

export default function FormUploadVideo() {
    const t = useTranslations('SnapiStudio.upload')

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
        onSubmit
    } = useUploadFormManager()

    const isUploading = uploadStatus === 'uploading'
    const isSubmitDisabled = isSubmitLoading || isUploading || !sessionUuid

    const content = form.watch('content')

    const handleAiCaptionSelect = (caption: string) => {
        form.setValue('content', caption, { shouldDirty: true, shouldValidate: true })
    }

    const handleAiApplied = (suggestion: AiContentSuggestionType) => {
        if (suggestion.short_caption) {
            form.setValue('content', suggestion.short_caption, { shouldDirty: true })
        }
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} onReset={onReset} method='POST'>
                    <AlertDialogExitPage isOpen={isOpenModalConfirmExit} onCancel={stayHere} onConfirm={leavePage} />

                    {isInitialRender ? (
                        /* ── Initial state: full-width dropzone ── */
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
                                {/* File / encoding status */}
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

                                {/* Action buttons */}
                                <div className='flex gap-3 pb-6'>
                                    <Button
                                        size='lg'
                                        variant='brand'
                                        type='submit'
                                        isLoading={isSubmitLoading}
                                        disabled={isSubmitDisabled}
                                        className='w-40'
                                    >
                                        {t('buttons.post')}
                                    </Button>
                                    <Button
                                        size='lg'
                                        variant='outline'
                                        type='reset'
                                        className='w-40'
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
                                    <VideoPreview content={content ?? ''} videoSrc={videoUrl} />
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </Form>

            {/* AI Floating Chat — only show after video is uploaded */}
            {!isInitialRender && (
                <AiFloatingChat
                    initialDescription={content ?? ''}
                    onCaptionSelect={handleAiCaptionSelect}
                    onApplied={handleAiApplied}
                />
            )}
        </>
    )
}
