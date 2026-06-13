import { User } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { UserResourcePreview } from '@/types/models/appeal.model'

export function UserPreview({ preview }: { preview: UserResourcePreview }) {
    const t = useTranslations('AppealPage.preview')

    return (
        <div className='flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 shadow-sm'>
            <Avatar className='h-10 w-10 shrink-0 ring-2 ring-slate-100'>
                <AvatarImage src={preview.avatar ?? undefined} />
                <AvatarFallback>
                    <User className='h-4 w-4' />
                </AvatarFallback>
            </Avatar>
            <div>
                <p className='text-[10px] font-semibold text-slate-400 uppercase tracking-wider'>{t('yourAccount')}</p>
                <p className='text-sm font-semibold text-slate-800'>@{preview.username}</p>
            </div>
        </div>
    )
}
