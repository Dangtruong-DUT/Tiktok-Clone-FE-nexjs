'use client'

import { useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { updateEncodingStatus, untrackEncoding, isTerminalStatus, TrackedEncoding } from '@/store/features/videoProcessingSlice'
import { useGetVideoUploadStatusQuery } from '@/store/services/upload.service'
import { VideoUploadStatus } from '@/constants/enum'
import { cn } from '@/lib/utils'
import { CheckCircle2, AlertCircle, X, ExternalLink, Loader2 } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { SNAPISTUDIO_ROUTES } from '@/constants/routes/routes'

const POLL_INTERVAL_MS = 3000

interface EncodingTrackerItemProps {
    item: TrackedEncoding
}

export function EncodingTrackerItem({ item }: EncodingTrackerItemProps) {
    const dispatch = useAppDispatch()
    const isTerminal = isTerminalStatus(item.status)

    const { data } = useGetVideoUploadStatusQuery(item.sessionUuid, {
        skip: isTerminal,
        pollingInterval: POLL_INTERVAL_MS
    })

    useEffect(() => {
        if (!data?.data) return
        const { status, encoding_progress } = data.data
        if (status !== item.status || encoding_progress !== item.progress) {
            dispatch(updateEncodingStatus({
                sessionUuid: item.sessionUuid,
                status,
                progress: encoding_progress
            }))
        }
    }, [data, dispatch, item.sessionUuid, item.status, item.progress])

    const handleDismiss = () => dispatch(untrackEncoding(item.sessionUuid))

    const isReady = item.status === VideoUploadStatus.READY
    const isFailed = item.status === VideoUploadStatus.FAILED || item.status === VideoUploadStatus.CANCELED

    const { label, barPercent } = resolveDisplay(item)

    return (
        <div className='group relative flex flex-col gap-2 rounded-lg border border-border bg-card px-3.5 py-3'>
            {/* Top row: status icon + label + dismiss */}
            <div className='flex items-center gap-2'>
                <StatusIcon status={item.status} />
                <span
                    className={cn('flex-1 truncate text-xs font-medium', {
                        'text-green-500': isReady,
                        'text-destructive': isFailed,
                        'text-muted-foreground': !isReady && !isFailed
                    })}
                >
                    {label}
                </span>

                {item.postUuid && isReady && (
                    <Link
                        href={SNAPISTUDIO_ROUTES.CONTENT}
                        className='flex items-center gap-1 text-[11px] text-brand hover:underline shrink-0'
                    >
                        View post
                        <ExternalLink className='size-3' />
                    </Link>
                )}

                {isTerminal && (
                    <button
                        onClick={handleDismiss}
                        className='shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground'
                        aria-label='Dismiss'
                    >
                        <X className='size-3.5' />
                    </button>
                )}
            </div>

            {/* Progress bar */}
            {!isTerminal && (
                <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
                    <div
                        className='h-full rounded-full bg-brand transition-all duration-500 ease-out'
                        style={{ width: `${Math.max(barPercent, 3)}%` }}
                    />
                </div>
            )}
        </div>
    )
}

// ---------------------------------------------------------------------------

function resolveDisplay(item: TrackedEncoding): { label: string; barPercent: number } {
    switch (item.status) {
        case VideoUploadStatus.PENDING:
        case VideoUploadStatus.UPLOADED:
            return { label: 'Waiting in encoding queue…', barPercent: 3 }
        case VideoUploadStatus.ANALYZING:
            return { label: 'Analyzing video…', barPercent: 10 }
        case VideoUploadStatus.TRANSCODING:
            return { label: `Encoding ${item.progress}%`, barPercent: item.progress }
        case VideoUploadStatus.READY:
            return { label: 'Video ready — HLS streaming enabled', barPercent: 100 }
        case VideoUploadStatus.FAILED:
        case VideoUploadStatus.CANCELED:
            return { label: 'Encoding failed', barPercent: 100 }
        default:
            return { label: 'Processing…', barPercent: 3 }
    }
}

function StatusIcon({ status }: { status: VideoUploadStatus }) {
    if (status === VideoUploadStatus.READY)
        return <CheckCircle2 className='size-3.5 shrink-0 text-green-500' />
    if (status === VideoUploadStatus.FAILED || status === VideoUploadStatus.CANCELED)
        return <AlertCircle className='size-3.5 shrink-0 text-destructive' />
    return <Loader2 className='size-3.5 shrink-0 animate-spin text-brand' />
}
