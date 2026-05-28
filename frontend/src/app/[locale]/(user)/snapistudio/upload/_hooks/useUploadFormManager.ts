'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useAppDispatch } from '@/store/hooks'
import { setLoadingByKey } from '@/store/features/appSlice'
import { trackEncoding } from '@/store/features/videoProcessingSlice'
import { useUploadImageMutation, useCancelVideoUploadMutation } from '@/store/services/upload.service'
import { useCreatePostMutation } from '@/store/services/posts.service'
import { useVideoUpload } from '@/hooks/video/useVideoUpload'
import { useVideoEncoding } from '@/hooks/video/useVideoEncoding'
import { convertBase64ToFile } from '@/utils/file.util'
import { extractHashtags } from '@/utils/social-token.util'
import { handleFormError } from '@/utils/errors/handle-form-errors.util'
import { logger } from '@/utils/logger.util'
import { useConfirmNavigation } from '@/hooks/shared/useConfirmNavigation'
import { useRouter } from '@/i18n/navigation'
import { SNAPISTUDIO_ROUTES } from '@/constants/routes/routes'
import { Audience, PosterType } from '@/constants/enum'
import { CreatePostReqBody, CreatePostReqBodyType } from '@/types/dtos/post/post-request.dto'
import useVideoFrames from '@/hooks/video/useVideoFrames'

const APP_LOADING_KEYS = {
    submitPost: 'upload.submit-post'
} as const

export function useUploadFormManager() {
    const t = useTranslations('SnapiStudio.upload')
    const dispatch = useAppDispatch()
    const router = useRouter()

    const [uploadImage, uploadImageResult] = useUploadImageMutation()
    const [createPost, createPostResult] = useCreatePostMutation()
    const [cancelVideoUpload] = useCancelVideoUploadMutation()

    const [isInitialRender, setIsInitialRender] = useState(true)
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
    const [videoUrl, setVideoUrl] = useState<string | null>(null)
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)

    const postCreatedRef = useRef(false)

    const {
        status: uploadStatus,
        uploadProgress,
        uploadedVideo,
        error: uploadError,
        retry: retryUpload
    } = useVideoUpload(videoFile)

    const encoding = useVideoEncoding(uploadedVideo?.uuid)

    const videoFrames = useVideoFrames(videoUrl, 10)

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

    const {
        showModal: isOpenModalConfirmExit,
        stayHere,
        leavePage: leavePageRaw
    } = useConfirmNavigation({
        shouldConfirm: videoFile != null
    })

    const isSubmitLoading = uploadImageResult.isLoading || createPostResult.isLoading

    // Video URL lifecycle
    useEffect(() => {
        if (!videoFile) {
            setVideoUrl(null)
            return
        }
        const url = URL.createObjectURL(videoFile)
        setVideoUrl(url)
        return () => URL.revokeObjectURL(url)
    }, [videoFile])

    // Thumbnail URL lifecycle
    useEffect(() => {
        if (!thumbnailFile) {
            setThumbnailUrl(null)
            return
        }
        const url = URL.createObjectURL(thumbnailFile)
        setThumbnailUrl(url)
        return () => URL.revokeObjectURL(url)
    }, [thumbnailFile])

    // Auto-extract thumbnail from first video frame
    useEffect(() => {
        const fetchFrame = async () => {
            if (videoUrl && videoFrames.length > 0) {
                const file = await convertBase64ToFile(videoFrames[0]!.image, 'video_thumbnail.png')
                if (file) setThumbnailFile(file)
            }
        }
        fetchFrame()
    }, [videoUrl, videoFrames])

    // Show upload error toasts
    useEffect(() => {
        if (!uploadError) return
        if (uploadError === 'invalid_response') toast.error(t('errors.invalidResponse'))
        else if (uploadError === 'unauthorized') toast.error(t('errors.unauthorized'))
        else if (uploadError === 'network_error') toast.error(t('errors.networkError'))
        else toast.error(t('errors.serverError', { status: '' }).replace(' (HTTP )', ''))
    }, [uploadError, t])

    // Sync global app loading state
    useEffect(() => {
        dispatch(setLoadingByKey({ key: APP_LOADING_KEYS.submitPost, isLoading: isSubmitLoading }))
        return () => {
            dispatch(setLoadingByKey({ key: APP_LOADING_KEYS.submitPost, isLoading: false }))
        }
    }, [dispatch, isSubmitLoading])

    const cancelUploadIfNeeded = useCallback(() => {
        if (uploadedVideo?.uuid && !postCreatedRef.current) {
            cancelVideoUpload(uploadedVideo.uuid)
        }
    }, [uploadedVideo, cancelVideoUpload])

    const leavePage = useCallback(() => {
        cancelUploadIfNeeded()
        leavePageRaw()
    }, [cancelUploadIfNeeded, leavePageRaw])

    const onReset = useCallback(() => {
        if (isSubmitLoading) return
        cancelUploadIfNeeded()
        postCreatedRef.current = false
        setVideoFile(null)
        setThumbnailFile(null)
        form.reset()
    }, [isSubmitLoading, cancelUploadIfNeeded, form])

    const onSubmit = async (data: CreatePostReqBodyType) => {
        if (isSubmitLoading || !videoFile || !thumbnailFile || !uploadedVideo) return

        try {
            const formDataThumbnail = new FormData()
            formDataThumbnail.append('file', thumbnailFile)
            const imageResponse = await uploadImage(formDataThumbnail).unwrap()

            const body: CreatePostReqBodyType = {
                ...data,
                hashtags: extractHashtags(data.content),
                mentions: undefined,
                medias: [{ type: encoding.mediaType, file_id: uploadedVideo.id }],
                thumbnail: imageResponse.data.id
            }

            const res = await createPost(body).unwrap()
            postCreatedRef.current = true

            if (!encoding.isTerminal) {
                dispatch(
                    trackEncoding({
                        uploadFileUuid: uploadedVideo.uuid,
                        postUuid: res.data.uuid,
                        status: encoding.status,
                        progress: encoding.progress,
                        trackedAt: new Date().toISOString()
                    })
                )
            }

            toast.success(res.message, { position: 'top-center' })
            onReset()
            router.push(SNAPISTUDIO_ROUTES.CONTENT)
        } catch (error) {
            logger.error(error)
            handleFormError<CreatePostReqBodyType>({ error, setFormError: form.setError })
        }
    }

    return {
        form,
        isInitialRender,
        setIsInitialRender,
        videoFile,
        setVideoFile,
        thumbnailFile,
        setThumbnailFile,
        videoUrl,
        thumbnailUrl,
        videoFrames,
        uploadStatus,
        uploadProgress,
        uploadedVideo,
        uploadError,
        retryUpload,
        encoding,
        isSubmitLoading,
        isOpenModalConfirmExit,
        stayHere,
        leavePage,
        onReset,
        onSubmit
    }
}
