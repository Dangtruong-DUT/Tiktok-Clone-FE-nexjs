import Image from 'next/image'
import { FileText } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { PostResourcePreview } from '@/types/models/appeal.model'

export function PostPreview({ preview }: { preview: PostResourcePreview }) {
    const t = useTranslations('AppealPage.preview')

    return (
        <div className='flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 shadow-sm'>
            {preview.thumbnail_url ? (
                <div className='relative h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 shadow-sm'>
                    <Image src={preview.thumbnail_url} alt='Post' fill className='object-cover' unoptimized />
                </div>
            ) : (
                <div className='flex h-14 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100'>
                    <FileText className='h-4 w-4 text-slate-400' />
                </div>
            )}
            <div className='min-w-0 flex-1'>
                <p className='text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5'>
                    {t('relatedPost')}
                </p>
                <p className='text-sm text-slate-800 line-clamp-2 leading-snug'>{preview.content || '—'}</p>
                {preview.author && <p className='text-xs text-slate-400 mt-1'>@{preview.author.username}</p>}
            </div>
        </div>
    )
}
