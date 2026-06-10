'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useAppDispatch } from '@/store/hooks'
import { setLoadingByKey } from '@/store/features/appSlice'
import { trackEncoding } from '@/store/features/videoProcessingSlice'
import { useUploadImageMutation } from '@/store/services/upload.service'
import { useCreatePostMutation } from '@/store/services/posts.service'
import { useSchedulePostMutation } from '@/store/services/studio-post-schedule.service'
import { useVideoUpload } from '@/hooks/video/useVideoUpload'
import { useVideoStatus } from '@/hooks/video/useVideoStatus'
import { convertBase64ToFile } from '@/utils/file.util'
import { extractHashtags } from '@/utils/social-token.util'
import { handleFormError } from '@/utils/errors/handle-form-errors.util'
import { logger } from '@/utils/logger.util'
import { useConfirmNavigation } from '@/hooks/shared/useConfirmNavigation'
import { useRouter } from '@/i18n/navigation'
import { SNAPISTUDIO_ROUTES } from '@/constants/routes/routes'
import { Audience, MediaType, PosterType, VideoUploadStatus } from '@/constants/enum'
import { CreatePostReqBody, CreatePostReqBodyType } from '@/types/dtos/post/post-request.dto'
import useVideoFrames from '@/hooks/video/useVideoFrames'
import UploadSessionApi from '@/apis/upload-session.request'

const APP_LOADING_KEYS = {
    submitPost: 'upload.submit-post'
} as const

export function useUploadFormManager() {
    const t = useTranslations('SnapiStudio.upload')
    const dispatch = useAppDispatch()
    const router = useRouter()

    const [uploadImage, uploadImageResult] = useUploadImageMutation()
    const [createPost, createPostResult] = useCreatePostMutation()
    const [schedulePost, schedulePostResult] = useSchedulePostMutation()

    const scheduledAtRef = useRef<string | null>(null)
    const setScheduledAt = useCallback((iso: string | null) => {
        scheduledAtRef.current = iso
    }, [])

    const [isInitialRender, setIsInitialRender] = useState(true)
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
    const [videoUrl, setVideoUrl] = useState<string | null>(null)
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)

    const postCreatedRef = useRef(false)

    const {
        status: uploadStatus,
        uploadProgress,
        sessionUuid,
        error: uploadError,
        upload,
        cancel: cancelUpload,
        retry: retryUpload
    } = useVideoUpload()

    const videoStatus = useVideoStatus(uploadStatus === 'done' ? sessionUuid : null)

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

    const isSubmitLoading = uploadImageResult.isLoading || createPostResult.isLoading || schedulePostResult.isLoading

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

    // Trigger upload when file is selected
    useEffect(() => {
        if (videoFile) {
            upload(videoFile)
        }
    }, [videoFile])

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
        if (sessionUuid && !postCreatedRef.current) {
            UploadSessionApi.abort(sessionUuid).catch(() => {})
            cancelUpload()
        }
    }, [sessionUuid, cancelUpload])

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
        if (isSubmitLoading || !videoFile || !thumbnailFile || !sessionUuid) return

        try {
            const formDataThumbnail = new FormData()
            formDataThumbnail.append('file', thumbnailFile)
            const imageResponse = await uploadImage(formDataThumbnail).unwrap()

            const mediaType = videoStatus.status === VideoUploadStatus.READY ? MediaType.HLS_VIDEO : MediaType.VIDEO

            const body: CreatePostReqBodyType = {
                ...data,
                hashtags: extractHashtags(data.content),
                mentions: undefined,
                medias: [{ type: mediaType, session_uuid: sessionUuid }],
                thumbnail: imageResponse.data.id
            }

            const res = await createPost(body).unwrap()
            postCreatedRef.current = true

            if (!videoStatus.isTerminal) {
                dispatch(
                    trackEncoding({
                        sessionUuid,
                        postUuid: res.data.uuid,
                        status: videoStatus.status,
                        progress: videoStatus.encodingProgress,
                        trackedAt: new Date().toISOString()
                    })
                )
            }

            const scheduledAt = scheduledAtRef.current
            if (scheduledAt) {
                await schedulePost({
                    postUuid: res.data.uuid,
                    scheduled_at: new Date(scheduledAt).toISOString(),
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }).unwrap()
                toast.success(t('toast.scheduled'), { position: 'top-center' })
            } else {
                toast.success(res.message, { position: 'top-center' })
            }

            scheduledAtRef.current = null
            onReset()
            router.push(SNAPISTUDIO_ROUTES.CONTENT)
        } catch (error) {
            logger.error(error)
            handleFormError<CreatePostReqBodyType>({ error, setFormError: form.setError })
        }
    }

    const onSaveAsDraft = async () => {
        const data = form.getValues()
        if (isSubmitLoading || !videoFile || !sessionUuid) return

        try {
            const mediaType = videoStatus.status === VideoUploadStatus.READY ? MediaType.HLS_VIDEO : MediaType.VIDEO

            let thumbnailId: number | undefined
            if (thumbnailFile) {
                const formDataThumbnail = new FormData()
                formDataThumbnail.append('file', thumbnailFile)
                const imageResponse = await uploadImage(formDataThumbnail).unwrap()
                thumbnailId = imageResponse.data.id
            }

            const body = {
                ...data,
                hashtags: extractHashtags(data.content),
                mentions: undefined,
                medias: [{ type: mediaType, session_uuid: sessionUuid }],
                thumbnail: thumbnailId,
                save_as_draft: true as const
            }

            await createPost(body).unwrap()
            postCreatedRef.current = true
            toast.success(t('toast.draftSaved'), { position: 'top-center' })
            scheduledAtRef.current = null
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
        onSaveAsDraft,
        setScheduledAt
    }
}
