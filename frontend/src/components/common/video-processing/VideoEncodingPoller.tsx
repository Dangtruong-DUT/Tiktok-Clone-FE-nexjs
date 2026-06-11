'use client'

import { useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { VideoUploadStatus } from '@/constants/enum'
import { SNAPISTUDIO_ROUTES } from '@/constants/routes/routes'
import { useAppDispatch } from '@/store/hooks'
import {
    TrackedEncoding,
    isTerminalStatus,
    untrackEncoding,
    updateEncodingStatus
} from '@/store/features/videoProcessingSlice'
import { useGetVideoUploadStatusQuery } from '@/store/services/content/upload.service'
import { useAppSelector } from '@/store/hooks'

interface VideoEncodingPollerProps {
    encoding: TrackedEncoding
}

export function VideoEncodingPoller({ encoding }: VideoEncodingPollerProps) {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const t = useTranslations('SnapiStudio.upload.processing')

    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

    const { data, isError } = useGetVideoUploadStatusQuery(encoding.sessionUuid, {
        pollingInterval: 5000,
        skip: isTerminalStatus(encoding.status) || !isAuthenticated
    })

    useEffect(() => {
        if (!isError) return
        dispatch(untrackEncoding(encoding.sessionUuid))
    }, [isError, dispatch, encoding.sessionUuid])

    useEffect(() => {
        if (!data) return

        const { status, encoding_progress: progress } = data.data
        dispatch(updateEncodingStatus({ sessionUuid: encoding.sessionUuid, status, progress }))

        if (status === VideoUploadStatus.READY) {
            toast.success(t('readyNoTitle'), {
                action: {
                    label: t('viewDetails'),
                    onClick: () => router.push(SNAPISTUDIO_ROUTES.CONTENT)
                }
            })
            dispatch(untrackEncoding(encoding.sessionUuid))
        } else if (status === VideoUploadStatus.FAILED || status === VideoUploadStatus.CANCELED) {
            toast.error(t('failed'))
            dispatch(untrackEncoding(encoding.sessionUuid))
        }
    }, [data, dispatch, encoding.sessionUuid, router, t])

    return null
}
