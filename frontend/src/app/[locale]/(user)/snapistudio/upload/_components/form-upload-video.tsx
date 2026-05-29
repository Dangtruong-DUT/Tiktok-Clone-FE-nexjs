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

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} onReset={onReset} method='POST'>
                <AlertDialogExitPage isOpen={isOpenModalConfirmExit} onCancel={stayHere} onConfirm={leavePage} />

                <UploadVideo
                    onFileSelect={setVideoFile}
                    file={videoFile}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                    uploadError={uploadError}
                    onRetryUpload={retryUpload}
                    videoStatus={videoStatus}
                    className='mb-8'
                    onReset={onReset}
                    setIsInitialRender={setIsInitialRender}
                    isInitialRender={isInitialRender}
                />

                {!isInitialRender && (
                    <div className='grid grid-cols-[70%_30%] gap-4'>
                        <div>
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
                                                    rows={30}
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
                            <div className='rounded-lg border border-border p-5 mt-[16px]'>
                                <FormField
                                    control={form.control}
                                    name='audience'
                                    render={({ field }) => (
                                        <FormItem className='w-[280px]'>
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

                            <div className='flex gap-4 mt-10'>
                                <Button
                                    size='lg'
                                    variant='brand'
                                    type='submit'
                                    isLoading={isSubmitLoading}
                                    disabled={isSubmitDisabled}
                                    className='w-[200px]'
                                >
                                    {t('buttons.post')}
                                </Button>
                                <Button
                                    size='lg'
                                    variant='secondary'
                                    type='reset'
                                    className='cursor-pointer w-[200px]'
                                    onClick={onReset}
                                    disabled={isSubmitLoading || isUploading}
                                >
                                    {t('buttons.discard')}
                                </Button>
                            </div>
                        </div>
                        <VideoPreview content={content ?? ''} videoSrc={videoUrl} className='mt-5 mx-auto' />
                    </div>
                )}
            </form>
        </Form>
    )
}
