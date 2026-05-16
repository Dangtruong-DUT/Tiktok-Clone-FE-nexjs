'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { CreatePostReqBodyType, UpdatePostReqBody, UpdatePostReqBodyType } from '@/types/dtos/post/post-request.dto'
import { zodResolver } from '@hookform/resolvers/zod'
import { Audience } from '@/constants/enum'
import { Info, Loader } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import VideoPreview from '@/app/[locale]/(user)/snapistudio/upload/_components/video-preview'
import SelectThumbnailDialog from '@/app/[locale]/(user)/snapistudio/upload/_components/select-thumbnail-dialog'
import AudienceSelect from '@/components/audience-select'

import { useUploadImageMutation } from '@/store/services/upload.service'
import { useGetPostDetailQuery, useUpdatePostMutation } from '@/store/services/posts.service'
import { handleFormError } from '@/utils/handleErrors/handleFormErrors.util'
import { SearchParamsLoader, useSearchParamsLoader } from '@/components/searchparams-loader'
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
import MentionHashtagTextField from '@/components/mention-hashtag-text-field'
import { logger } from '@/utils/logger'

export default function FormUpdatePost() {
    const t = useTranslations('SnapiStudio.upload')
    const { id } = useParams<{ id: string }>() ?? { id: '' }
    const [uploadImageMutate, uploadImageResult] = useUploadImageMutation()
    const [updatePostMutate, createPostResult] = useUpdatePostMutation()
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

    const [videoUrl, setVideoUrl] = useState<string | null>(null)

    const videoFrames = useVideoFrames(videoUrl, 10)

    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)

    useEffect(() => {
        if (!id) {
            router.push(`/snapistudio/upload`)
        }
    }, [id, router])

    useEffect(() => {
        if (post) {
            form.setValue('content', post.content)
            form.setValue('audience', post.audience as any)
            form.setValue('thumbnail', post.thumbnail_file_id ?? undefined)
            form.setValue(
                'hashtags',
                Array.from(new Set((post.hashtags ?? []).map((hashtag) => hashtag.name.toLowerCase())))
            )
            form.setValue('mentions', Array.from(new Set((post.mentions ?? []).map((mention) => mention.id))))
            setVideoUrl(post.medias?.[0]?.url || null)
            setThumbnailUrl(post.thumbnail_url || null)
        }
    }, [post, form])

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

    const isCreatePostLoading = createPostResult.isLoading || uploadImageResult.isLoading

    const onsubmit = async (data: UpdatePostReqBodyType) => {
        if (isCreatePostLoading || !post) return
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
            await updatePostMutate({ post_uuid: post.uuid, body }).unwrap()
            toast('Post updated successfully')
        } catch (error) {
            logger.error(error)
            handleFormError<CreatePostReqBodyType>({
                error,
                setFormError: form.setError
            })
        }
    }

    const onCancel = () => {
        if (isCreatePostLoading) return
        if (redirectFrom) {
            router.push(redirectFrom)
        } else {
            router.push('/snapistudio/content')
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
                        <div className='flex gap-4 mt-10'>
                            <Button
                                className='primary-button cursor-pointer h-9! rounded-lg! w-[200px]! font-medium!'
                                type='submit'
                                disabled={isCreatePostLoading}
                            >
                                {isCreatePostLoading ? <Loader className='animate-spin text-brand' /> : 'Save'}
                            </Button>
                            <Button
                                variant={'secondary'}
                                type='button'
                                className='cursor-pointer h-9 rounded-lg w-[200px] font-base'
                                onClick={onCancel}
                                disabled={isCreatePostLoading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                    <VideoPreview content={content ?? ''} videoSrc={videoUrl} className='mt-5 mx-auto' />
                </div>
            </form>
        </Form>
    )
}
