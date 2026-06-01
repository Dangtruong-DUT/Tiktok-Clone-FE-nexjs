'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { VideoUploadStatus } from '@/constants/enum'
import { CheckCircle2, AlertCircle, RefreshCw, Upload, ScanSearch, Clapperboard } from 'lucide-react'
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
    const { label, barPercent, variant, step } = resolveDisplay({
        isUploading,
        uploadProgress,
        videoStatus,
        encodingProgress,
        t
    })

    return (
        <div className={cn('w-full space-y-3', className)}>
            {/* Step indicators */}
            <div className='flex items-center gap-1'>
                <StepDot icon={<Upload className='size-2.5' />} active={step >= 1} done={step > 1} label='Upload' />
                <div
                    className={cn('h-px flex-1 transition-colors duration-500', step > 1 ? 'bg-brand' : 'bg-border')}
                />
                <StepDot
                    icon={<ScanSearch className='size-2.5' />}
                    active={step >= 2}
                    done={step > 2}
                    label='Analyze'
                />
                <div
                    className={cn('h-px flex-1 transition-colors duration-500', step > 2 ? 'bg-brand' : 'bg-border')}
                />
                <StepDot
                    icon={<Clapperboard className='size-2.5' />}
                    active={step >= 3}
                    done={step > 3}
                    label='Encode'
                />
                <div
                    className={cn('h-px flex-1 transition-colors duration-500', step > 3 ? 'bg-brand' : 'bg-border')}
                />
                <StepDot
                    icon={<CheckCircle2 className='size-2.5' />}
                    active={step >= 4}
                    done={step >= 4}
                    label='Ready'
                    isSuccess={step >= 4 && variant === ENCODING_PROGRESS_VARIANT.SUCCESS}
                />
            </div>

            {/* Status row */}
            <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2'>
                    <StatusIcon variant={variant} />
                    <span
                        className={cn('text-sm font-medium', {
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

                {variant === ENCODING_PROGRESS_VARIANT.LOADING && (
                    <span className='text-xs tabular-nums text-muted-foreground'>{barPercent}%</span>
                )}
            </div>

            {/* Progress bar */}
            {variant === ENCODING_PROGRESS_VARIANT.LOADING && (
                <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
                    <div
                        className='h-full rounded-full bg-brand transition-all duration-500 ease-out'
                        style={{ width: `${Math.max(barPercent, 2)}%` }}
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
    ERROR: 'error'
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
}): { label: string; barPercent: number; variant: Variant; step: number } {
    if (isUploading) {
        return {
            label: t('uploading', { progress: uploadProgress }),
            barPercent: uploadProgress,
            variant: ENCODING_PROGRESS_VARIANT.LOADING,
            step: 1
        }
    }

    switch (videoStatus) {
        case VideoUploadStatus.PENDING:
        case VideoUploadStatus.UPLOADED:
            return { label: t('pending'), barPercent: 2, variant: 'loading', step: 2 }

        case VideoUploadStatus.ANALYZING:
            return { label: t('analyzing'), barPercent: 10, variant: 'loading', step: 2 }

        case VideoUploadStatus.TRANSCODING:
            return {
                label: t('processing', { progress: encodingProgress }),
                barPercent: encodingProgress,
                variant: ENCODING_PROGRESS_VARIANT.LOADING,
                step: 3
            }

        case VideoUploadStatus.READY:
            return { label: t('ready'), barPercent: 100, variant: ENCODING_PROGRESS_VARIANT.SUCCESS, step: 4 }

        case VideoUploadStatus.FAILED:
        case VideoUploadStatus.CANCELED:
            return { label: t('failed'), barPercent: 100, variant: ENCODING_PROGRESS_VARIANT.ERROR, step: 0 }

        default:
            return { label: t('pending'), barPercent: 2, variant: 'loading', step: 1 }
    }
}

function StatusIcon({ variant }: { variant: Variant }) {
    switch (variant) {
        case ENCODING_PROGRESS_VARIANT.LOADING:
            return <LoadingIcon loop className='size-4 shrink-0' />
        case ENCODING_PROGRESS_VARIANT.SUCCESS:
            return <CheckCircle2 className='size-4 text-green-500 shrink-0' />
        case ENCODING_PROGRESS_VARIANT.ERROR:
            return <AlertCircle className='size-4 text-destructive shrink-0' />
    }
}

function StepDot({
    icon,
    active,
    done,
    label,
    isSuccess
}: {
    icon: React.ReactNode
    active: boolean
    done: boolean
    label: string
    isSuccess?: boolean
}) {
    return (
        <div className='flex flex-col items-center gap-1'>
            <div
                className={cn(
                    'flex size-5 items-center justify-center rounded-full border transition-all duration-300',
                    isSuccess
                        ? 'border-green-500 bg-green-500 text-white'
                        : active
                          ? 'border-brand bg-brand text-white'
                          : 'border-border bg-muted text-muted-foreground'
                )}
            >
                {icon}
            </div>
            <span
                className={cn(
                    'text-[10px] font-medium transition-colors duration-300',
                    active ? 'text-foreground' : 'text-muted-foreground'
                )}
            >
                {label}
            </span>
        </div>
    )
}
