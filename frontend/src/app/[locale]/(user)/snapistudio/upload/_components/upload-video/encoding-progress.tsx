'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { EncodingStatus } from '@/constants/enum'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface EncodingProgressProps {
    isUploading: boolean
    uploadProgress: number
    encodingStatus: EncodingStatus
    encodingProgress: number
    className?: string
}

export function EncodingProgress({
    isUploading,
    uploadProgress,
    encodingStatus,
    encodingProgress,
    className,
}: EncodingProgressProps) {
    const t = useTranslations('SnapiStudio.upload.encoding')

    const { label, barPercent, variant } = resolveDisplay({
        isUploading,
        uploadProgress,
        encodingStatus,
        encodingProgress,
        t,
    })

    return (
        <div className={cn('w-full space-y-1.5', className)}>
            <div className='flex items-center gap-2'>
                <StatusIcon variant={variant} />
                <span
                    className={cn('text-sm', {
                        'text-muted-foreground': variant === 'loading',
                        'text-green-500': variant === 'success',
                        'text-destructive': variant === 'error',
                    })}
                >
                    {label}
                </span>
            </div>

            {variant === 'loading' && (
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

type Variant = 'loading' | 'success' | 'error'

function resolveDisplay({
    isUploading,
    uploadProgress,
    encodingStatus,
    encodingProgress,
    t,
}: {
    isUploading: boolean
    uploadProgress: number
    encodingStatus: EncodingStatus
    encodingProgress: number
    t: ReturnType<typeof useTranslations<'SnapiStudio.upload.encoding'>>
}): { label: string; barPercent: number; variant: Variant } {
    if (isUploading) {
        return {
            label: t('uploading', { progress: uploadProgress }),
            barPercent: uploadProgress,
            variant: 'loading',
        }
    }

    switch (encodingStatus) {
        case EncodingStatus.PENDING:
            return { label: t('pending'), barPercent: 2, variant: 'loading' }

        case EncodingStatus.PROCESSING:
            return {
                label: t('processing', { progress: encodingProgress }),
                barPercent: encodingProgress,
                variant: 'loading',
            }

        case EncodingStatus.READY:
            return { label: t('ready'), barPercent: 100, variant: 'success' }

        case EncodingStatus.FAILED:
            return { label: t('failed'), barPercent: 100, variant: 'error' }
    }
}

function StatusIcon({ variant }: { variant: Variant }) {
    switch (variant) {
        case 'loading':
            return <Loader2 className='h-3.5 w-3.5 animate-spin text-muted-foreground shrink-0' />
        case 'success':
            return <CheckCircle2 className='h-3.5 w-3.5 text-green-500 shrink-0' />
        case 'error':
            return <AlertCircle className='h-3.5 w-3.5 text-destructive shrink-0' />
    }
}
