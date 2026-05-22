'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import UploadVideo from '@/app/[locale]/(user)/snapistudio/upload/_components/upload-video'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { CreatePostReqBody, CreatePostReqBodyType } from '@/types/dtos/post/post-request.dto'
import { zodResolver } from '@hookform/resolvers/zod'
import { Audience, MediaType, PosterType } from '@/constants/enum'
import { Info, Loader } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import VideoPreview from '@/app/[locale]/(user)/snapistudio/upload/_components/video-preview'
import SelectThumbnailDialog from '@/app/[locale]/(user)/snapistudio/upload/_components/select-thumbnail-dialog'
import AudienceSelect from '@/components/audience-select'
import { convertBase64ToFileToFile } from '@/utils/file.util'
import { useUploadImageMutation, useUploadVideoMutation } from '@/store/services/upload.service'
import { useCreatePostMutation } from '@/store/services/posts.service'
import { handleFormError } from '@/utils/handleErrors/handleFormErrors.util'
import { toast } from 'sonner'
import useVideoFrames from '@/hooks/video/useVideoFrames'
import { useRouter } from '@/i18n/navigation'
import { useConfirmNavigation } from '@/hooks/shared/useConfirmNavigation'
import AlertDialogExitPage from '@/app/[locale]/(user)/snapistudio/upload/_components/alert-confirm-leave-page'
import { useAppDispatch } from '@/store/hooks'
import { setLoadingByKey } from '@/store/features/appSlice'
import { extractHashtags } from '@/utils/socialToken.util'
import MentionHashtagTextField from '@/components/mention-hashtag-text-field'
import { logger } from '@/utils/logger'

const APP_LOADING_KEYS = {
    uploadVideoPost: 'upload.video-post'
} as const

export default function FormUploadVideo() {
    const t = useTranslations('SnapiStudio.upload')
    const dispatch = useAppDispatch()
    const [uploadImage, uploadImageResult] = useUploadImageMutation()
    const [uploadVideo, uploadVideoResult] = useUploadVideoMutation()
    const [createPost, createPostResult] = useCreatePostMutation()

    const router = useRouter()

    const isCreatePostLoading = createPostResult.isLoading || uploadVideoResult.isLoading || uploadImageResult.isLoading

    const [isInitialRender, setIsInitialRender] = useState(true)

    const form = useForm<CreatePostReqBodyType>({
        resolver: zodResolver(CreatePostReqBody),
        defaultValues: {
            audience: Audience.PUBLIC,
            content: '',
            hashtags: [],
            medias: [],
            mentions: [],
            thumbnail: undefined,
            type: PosterType.POST
        }
    })

    const [videoUrl, setVideoUrl] = useState<string | null>(null)

    const {
        showModal: isOpenModalConfirmExit,
        stayHere,
        leavePage
    } = useConfirmNavigation({
        shouldConfirm: videoUrl != null
    })

    const videoFrames = useVideoFrames(videoUrl, 10)

    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)

    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)

    useEffect(() => {
        if (!videoFile) {
            setVideoUrl(null)
            return
        }
        const url = URL.createObjectURL(videoFile)
        setVideoUrl(url)
        return () => URL.revokeObjectURL(url)
    }, [videoFile])

    useEffect(() => {
        if (!thumbnailFile) {
            setThumbnailUrl(null)
            return
        }
        const url = URL.createObjectURL(thumbnailFile)
        setThumbnailUrl(url)
        return () => URL.revokeObjectURL(url)
    }, [thumbnailFile])

    useEffect(() => {
        const fetchFrame = async () => {
            if (videoUrl && videoFrames.length > 0) {
                const file = await convertBase64ToFileToFile(videoFrames[0]!.image, 'video_thumbnail.png')
                if (file) setThumbnailFile(file)
            }
        }
        fetchFrame()
    }, [videoUrl, videoFrames])

    useEffect(() => {
        dispatch(
            setLoadingByKey({
                key: APP_LOADING_KEYS.uploadVideoPost,
                isLoading: isCreatePostLoading
            })
        )

        return () => {
            dispatch(
                setLoadingByKey({
                    key: APP_LOADING_KEYS.uploadVideoPost,
                    isLoading: false
                })
            )
        }
    }, [dispatch, isCreatePostLoading])

    const onReset = () => {
        if (isCreatePostLoading) return
        setVideoFile(null)
        setThumbnailFile(null)
        form.reset()
    }

    const onsubmit = async (data: CreatePostReqBodyType) => {
        if (isCreatePostLoading) return
        try {
            if (!videoFile || !thumbnailFile) return

            const formDataVideo = new FormData()
            formDataVideo.append('file', videoFile)
            const formDataThumbnail = new FormData()
            formDataThumbnail.append('file', thumbnailFile)

            const [videoResponse, imageResponse] = await Promise.all([
                uploadVideo(formDataVideo).unwrap(),
                uploadImage(formDataThumbnail).unwrap()
            ])

            const body: CreatePostReqBodyType = {
                ...data,
                hashtags: extractHashtags(data.content),
                mentions: undefined,
                medias: [
                    {
                        type: MediaType.VIDEO,
                        file_id: videoResponse.data.id
                    }
                ],
                thumbnail: imageResponse.data.id
            }

            const res = await createPost(body).unwrap()
            toast.success(res.message, {
                position: 'top-center'
            })
            onReset()
            router.push('/snapistudio/content')
        } catch (error) {
            logger.error(error)
            handleFormError<CreatePostReqBodyType>({
                error,
                setFormError: form.setError
            })
        }
    }

    const content = form.watch('content')
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onsubmit)} onReset={onReset} method='POST'>
                <AlertDialogExitPage isOpen={isOpenModalConfirmExit} onCancel={stayHere} onConfirm={leavePage} />
                <UploadVideo
                    onFileSelect={setVideoFile}
                    file={videoFile}
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
                                    className='primary-button cursor-pointer h-9! rounded-lg! w-[200px]! font-medium!'
                                    type='submit'
                                    disabled={isCreatePostLoading}
                                >
                                    {isCreatePostLoading ? (
                                        <Loader className='animate-spin text-brand' />
                                    ) : (
                                        t('buttons.post')
                                    )}
                                </Button>
                                <Button
                                    variant={'secondary'}
                                    type='reset'
                                    className='cursor-pointer h-9 rounded-lg w-[200px] font-base '
                                    onClick={onReset}
                                    disabled={isCreatePostLoading}
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
