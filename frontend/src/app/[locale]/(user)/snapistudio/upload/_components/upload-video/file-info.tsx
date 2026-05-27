import { Button } from '@/components/ui/button'
import { MdOutlinePublishedWithChanges } from 'react-icons/md'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTranslations } from 'next-intl'
import { EncodingProgress } from '@/app/[locale]/(user)/snapistudio/upload/_components/upload-video/encoding-progress'
import type { VideoEncodingState } from '@/hooks/video/useVideoEncoding'

interface FileInfoProps {
    file: File | null
    onReplaceFile: () => void
    isUploading: boolean
    uploadProgress: number
    encoding: VideoEncodingState
    className?: string
}

export default function FileInfo({ file, onReplaceFile, isUploading, uploadProgress, encoding, className }: FileInfoProps) {
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
                    disabled={isUploading || !encoding.isTerminal}
                    className='cursor-pointer'
                >
                    <MdOutlinePublishedWithChanges />
                    {t('replace')}
                </Button>
            </div>

            <EncodingProgress
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                encodingStatus={encoding.status}
                encodingProgress={encoding.progress}
            />
        </div>
    )
}
