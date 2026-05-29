import { Button } from '@/components/ui/button'
import { MdOutlinePublishedWithChanges } from 'react-icons/md'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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
    className,
}: FileInfoProps) {
    const t = useTranslations('SnapiStudio.upload.fileInfo')

    if (!file) return null

    const { name, size, type } = file

    const handleReplace = (e: React.MouseEvent) => {
        e.preventDefault()
        onReplaceFile()
    }

    return (
        <div className={cn('border border-border rounded-lg px-5 py-[27px] space-y-4', className)}>
            <div className='flex justify-between items-center'>
                <div>
                    <div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className='font-bold text-base mr-2'>{name}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{name}</p>
                            </TooltipContent>
                        </Tooltip>
                        <Badge variant={'outline'}>{type}</Badge>
                    </div>
                    <div className='mt-2 text-green-400 text-sm'>
                        <span>{t('size', { size: (size / (1024 * 1024)).toFixed(2) })}</span>
                    </div>
                </div>
                <Button
                    size='lg'
                    variant='secondary'
                    type='button'
                    onClick={handleReplace}
                    disabled={isUploading || !videoStatus.isTerminal}
                    className='cursor-pointer'
                >
                    <MdOutlinePublishedWithChanges />
                    {t('replace')}
                </Button>
            </div>

            {uploadError ? (
                <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                        <AlertCircle className='h-3.5 w-3.5 text-destructive shrink-0' />
                        <span className='text-sm text-destructive'>{uploadError}</span>
                    </div>
                    {onRetryUpload && (
                        <Button
                            size='sm'
                            variant='outline'
                            type='button'
                            onClick={onRetryUpload}
                            className='h-7 gap-1.5 text-xs'
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
    )
}
