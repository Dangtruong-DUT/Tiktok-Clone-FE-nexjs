import { Video, File, MonitorPlay } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MdAspectRatio } from 'react-icons/md'
import { useTranslations } from 'next-intl'

interface UploadGuideLineProps {
    className?: string
}

const guidelines = [
    { icon: Video, key: 'sizeAndDuration' },
    { icon: File, key: 'fileFormats' },
    { icon: MonitorPlay, key: 'videoResolutions' },
    { icon: MdAspectRatio, key: 'aspectRatios' }
] as const

export default function UploadGuideLine({ className }: UploadGuideLineProps) {
    const t = useTranslations('SnapiStudio.upload')
    return (
        <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-4', className)}>
            {guidelines.map(({ icon: Icon, key }) => (
                <div
                    key={key}
                    className='flex items-start gap-2.5 rounded-lg border border-border bg-card px-3 py-3 shadow-xs'
                >
                    <div className='mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-xl bg-muted'>
                        <Icon className='size-3.5 text-muted-foreground' />
                    </div>
                    <div>
                        <h3 className='text-xs font-semibold leading-snug'>{t(`guidelines.${key}.title`)}</h3>
                        <p className='mt-0.5 text-[11px] text-muted-foreground leading-snug'>
                            {t(`guidelines.${key}.description`)}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}
