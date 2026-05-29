'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { VideoUploadStatus } from '@/constants/enum'
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import LoadingIcon from '@/components/lottie-icons/loading'
import { Button } from '@/components/ui/button'

interface EncodingProgressProps {
    isUploading: boolean
    uploadProgress: number
    videoStatus: VideoUploadStatus
    encodingProgress: number
    onRetry?: () => void
    isRetrying?: boolean
    className?: string
}

export function EncodingProgress({
    isUploading,
    uploadProgress,
    videoStatus,
    encodingProgress,
    onRetry,
    isRetrying,
    className
}: EncodingProgressProps) {
    const t = useTranslations('SnapiStudio.upload.encoding')

    const { label, barPercent, variant } = resolveDisplay({
        isUploading,
        uploadProgress,
        videoStatus,
        encodingProgress,
        t
    })

    return (
        <div className={cn('w-full space-y-1.5', className)}>
            <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2'>
                    <StatusIcon variant={variant} />
                    <span
                        className={cn('text-sm', {
                            'text-muted-foreground': variant === ENCODING_PROGRESS_VARIANT.LOADING,
                            'text-green-500': variant === ENCODING_PROGRESS_VARIANT.SUCCESS,
                            'text-destructive': variant === ENCODING_PROGRESS_VARIANT.ERROR
                        })}
                    >
                        {label}
                    </span>
                </div>

                {variant === ENCODING_PROGRESS_VARIANT.ERROR && onRetry && (
                    <Button
                        size='sm'
                        variant='outline'
                        type='button'
                        onClick={onRetry}
                        disabled={isRetrying}
                        className='h-7 gap-1.5 text-xs'
                    >
                        <RefreshCw className={cn('size-3', { 'animate-spin': isRetrying })} />
                        {t('retry')}
                    </Button>
                )}
            </div>

            {variant === ENCODING_PROGRESS_VARIANT.LOADING && (
                <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
                    <div
                        className='h-full rounded-full bg-primary transition-all duration-300'
                        style={{ width: `${barPercent}%` }}
                    />
                </div>
            )}
        </div>
    )
}

// ---------------------------------------------------------------------------

const ENCODING_PROGRESS_VARIANT = {
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR:   'error',
} as const
type Variant = (typeof ENCODING_PROGRESS_VARIANT)[keyof typeof ENCODING_PROGRESS_VARIANT]

function resolveDisplay({
    isUploading,
    uploadProgress,
    videoStatus,
    encodingProgress,
    t
}: {
    isUploading: boolean
    uploadProgress: number
    videoStatus: VideoUploadStatus
    encodingProgress: number
    t: ReturnType<typeof useTranslations<'SnapiStudio.upload.encoding'>>
}): { label: string; barPercent: number; variant: Variant } {
    if (isUploading) {
        return {
            label: t('uploading', { progress: uploadProgress }),
            barPercent: uploadProgress,
            variant: ENCODING_PROGRESS_VARIANT.LOADING
        }
    }

    switch (videoStatus) {
        case VideoUploadStatus.PENDING:
        case VideoUploadStatus.UPLOADED:
            return { label: t('pending'), barPercent: 2, variant: 'loading' }

        case VideoUploadStatus.ANALYZING:
            return { label: t('analyzing'), barPercent: 5, variant: 'loading' }

        case VideoUploadStatus.TRANSCODING:
            return {
                label: t('processing', { progress: encodingProgress }),
                barPercent: encodingProgress,
                variant: ENCODING_PROGRESS_VARIANT.LOADING
            }

        case VideoUploadStatus.READY:
            return { label: t('ready'), barPercent: 100, variant: ENCODING_PROGRESS_VARIANT.SUCCESS }

        case VideoUploadStatus.FAILED:
        case VideoUploadStatus.CANCELED:
            return { label: t('failed'), barPercent: 100, variant: ENCODING_PROGRESS_VARIANT.ERROR }

        default:
            return { label: t('pending'), barPercent: 2, variant: 'loading' }
    }
}

function StatusIcon({ variant }: { variant: Variant }) {
    switch (variant) {
        case ENCODING_PROGRESS_VARIANT.LOADING:
            return <LoadingIcon loop className='size-4 shrink-0' />
        case ENCODING_PROGRESS_VARIANT.SUCCESS:
            return <CheckCircle2 className='h-3.5 w-3.5 text-green-500 shrink-0' />
        case ENCODING_PROGRESS_VARIANT.ERROR:
            return <AlertCircle className='h-3.5 w-3.5 text-destructive shrink-0' />
    }
}
