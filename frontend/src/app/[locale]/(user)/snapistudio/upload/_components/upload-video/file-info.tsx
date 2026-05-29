import { Button } from '@/components/ui/button'
import { MdOutlinePublishedWithChanges } from 'react-icons/md'
import { AlertCircle, RefreshCw, FileVideo } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { EncodingProgress } from '@/app/[locale]/(user)/snapistudio/upload/_components/upload-video/encoding-progress'
import type { VideoStatusState } from '@/hooks/video/useVideoStatus'

interface FileInfoProps {
    file: File | null
    onReplaceFile: () => void
    isUploading: boolean
    uploadProgress: number
    uploadError?: string | null
    onRetryUpload?: () => void
    videoStatus: VideoStatusState
    className?: string
}

export default function FileInfo({
    file,
    onReplaceFile,
    isUploading,
    uploadProgress,
    uploadError,
    onRetryUpload,
    videoStatus,
    className
}: FileInfoProps) {
    const t = useTranslations('SnapiStudio.upload.fileInfo')

    if (!file) return null

    const { name, size, type } = file
    const sizeMb = (size / (1024 * 1024)).toFixed(2)

    const handleReplace = (e: React.MouseEvent) => {
        e.preventDefault()
        onReplaceFile()
    }

    return (
        <div className={cn('rounded-xl border border-border bg-card shadow-sm', className)}>
            {/* File header */}
            <div className='flex items-center gap-4 border-b border-border px-5 py-4'>
                <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand/10'>
                    <FileVideo className='size-5 text-brand' />
                </div>
                <div className='min-w-0 flex-1'>
                    <p className='truncate font-semibold leading-tight' title={name}>
                        {name}
                    </p>
                    <p className='mt-0.5 text-xs text-muted-foreground'>
                        {type} · {sizeMb} MB
                    </p>
                </div>
                <Button
                    size='sm'
                    variant='outline'
                    type='button'
                    onClick={handleReplace}
                    disabled={isUploading || !videoStatus.isTerminal}
                    className='shrink-0 gap-1.5'
                >
                    <MdOutlinePublishedWithChanges className='size-3.5' />
                    {t('replace')}
                </Button>
            </div>

            {/* Status body */}
            <div className='px-5 py-4'>
                {uploadError ? (
                    <div className='flex items-center justify-between gap-3 rounded-lg bg-destructive/8 px-3 py-2.5'>
                        <div className='flex items-center gap-2'>
                            <AlertCircle className='size-4 text-destructive shrink-0' />
                            <span className='text-sm text-destructive'>{uploadError}</span>
                        </div>
                        {onRetryUpload && (
                            <Button
                                size='sm'
                                variant='outline'
                                type='button'
                                onClick={onRetryUpload}
                                className='h-7 gap-1.5 text-xs border-destructive/30 hover:bg-destructive/5'
                            >
                                <RefreshCw className='size-3' />
                                {t('retry')}
                            </Button>
                        )}
                    </div>
                ) : (
                    <EncodingProgress
                        isUploading={isUploading}
                        uploadProgress={uploadProgress}
                        videoStatus={videoStatus.status}
                        encodingProgress={videoStatus.encodingProgress}
                        onRetry={onRetryUpload}
                    />
                )}
            </div>
        </div>
    )
}
