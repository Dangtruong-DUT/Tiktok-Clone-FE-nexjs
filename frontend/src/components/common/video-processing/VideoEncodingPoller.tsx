'use client'

import { useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { EncodingStatus } from '@/constants/enum'
import { SNAPISTUDIO_ROUTES } from '@/constants/routes/routes'
import { useAppDispatch } from '@/store/hooks'
import { TrackedEncoding, isTerminalStatus, untrackEncoding, updateEncodingStatus } from '@/store/features/videoProcessingSlice'
import { useGetVideoEncodingStatusQuery } from '@/store/services/upload.service'

interface VideoEncodingPollerProps {
    encoding: TrackedEncoding
}

export function VideoEncodingPoller({ encoding }: VideoEncodingPollerProps) {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const t = useTranslations('SnapiStudio.upload.processing')

    const { data } = useGetVideoEncodingStatusQuery(encoding.uploadFileUuid, {
        pollingInterval: 5000,
        skip: isTerminalStatus(encoding.status)
    })

    useEffect(() => {
        if (!data) return

        const { status, progress } = data.data
        dispatch(updateEncodingStatus({ uuid: encoding.uploadFileUuid, status, progress }))

        if (status === EncodingStatus.READY) {
            toast.success(t('readyNoTitle'), {
                action: {
                    label: t('viewDetails'),
                    onClick: () => router.push(SNAPISTUDIO_ROUTES.CONTENT)
                }
            })
            dispatch(untrackEncoding(encoding.uploadFileUuid))
        } else if (status === EncodingStatus.FAILED) {
            toast.error(t('failed'))
            dispatch(untrackEncoding(encoding.uploadFileUuid))
        }
    }, [data, dispatch, encoding.uploadFileUuid, router, t])

    return null
}
