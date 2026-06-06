import Image from 'next/image'
import { AlertCircle, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { RESOURCE_PREVIEW_TYPES } from '@/constants/appeal'
import type { ResourcePreview } from '@/types/models/appeal.model'

export function ResourcePreviewBlock({ preview }: { preview: ResourcePreview }) {
    if (preview.type === RESOURCE_PREVIEW_TYPES.POST) {
        return (
            <div className='space-y-3'>
                {preview.is_deleted && (
                    <div className='flex items-center gap-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs text-red-600 dark:text-red-400'>
                        <AlertCircle className='h-3.5 w-3.5 shrink-0' />
                        Post was deleted — showing cached info
                    </div>
                )}
                {preview.thumbnail_url && (
                    <div className='relative h-[180px] w-full rounded-lg overflow-hidden bg-black'>
                        <Image
                            src={preview.thumbnail_url}
                            alt='Post thumbnail'
                            fill
                            className='object-cover opacity-90'
                            unoptimized
                        />
                    </div>
                )}
                <div className='space-y-1'>
                    {preview.content && <p className='text-sm text-foreground line-clamp-3'>{preview.content}</p>}
                    {preview.author && (
                        <div className='flex items-center gap-2 mt-2'>
                            <Avatar className='size-6'>
                                <AvatarImage src={preview.author.avatar ?? undefined} />
                                <AvatarFallback className='text-xs'>
                                    {preview.author.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className='text-xs text-muted-foreground'>@{preview.author.username}</span>
                        </div>
                    )}
                </div>
                {(preview.likes_count !== undefined || preview.comments_count !== undefined) && (
                    <div className='flex gap-4 text-xs text-muted-foreground border-t pt-2'>
                        <span>{preview.likes_count ?? 0} likes</span>
                        <span>{preview.comments_count ?? 0} comments</span>
                    </div>
                )}
            </div>
        )
    }

    if (preview.type === RESOURCE_PREVIEW_TYPES.COMMENT) {
        return (
            <div className='space-y-3'>
                {preview.is_deleted && (
                    <div className='flex items-center gap-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs text-red-600 dark:text-red-400'>
                        <AlertCircle className='h-3.5 w-3.5 shrink-0' />
                        Comment was deleted — showing cached info
                    </div>
                )}
                {preview.author && (
                    <div className='flex items-center gap-2'>
                        <Avatar className='size-8'>
                            <AvatarImage src={preview.author.avatar ?? undefined} />
                            <AvatarFallback className='text-xs'>
                                {preview.author.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span className='text-sm font-medium'>@{preview.author.username}</span>
                    </div>
                )}
                <div className='rounded-lg bg-muted/40 px-4 py-3'>
                    <p className='text-sm'>{preview.content}</p>
                </div>
            </div>
        )
    }

    if (preview.type === RESOURCE_PREVIEW_TYPES.USER) {
        return (
            <div className='flex flex-col items-center gap-3 py-4'>
                <Avatar className='size-16'>
                    <AvatarImage src={preview.avatar ?? undefined} />
                    <AvatarFallback>
                        <User className='h-8 w-8' />
                    </AvatarFallback>
                </Avatar>
                <p className='font-semibold'>@{preview.username}</p>
                <div className='flex gap-2'>
                    {preview.is_banned && (
                        <Badge variant='outline' className='bg-red-50 text-red-700 border-red-200 text-xs'>
                            Banned
                        </Badge>
                    )}
                    {preview.is_deleted && (
                        <Badge variant='outline' className='bg-gray-100 text-gray-600 border-gray-200 text-xs'>
                            Deleted
                        </Badge>
                    )}
                </div>
            </div>
        )
    }

    return null
}
