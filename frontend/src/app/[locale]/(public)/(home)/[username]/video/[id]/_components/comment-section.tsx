'use client'

import CommentForm from '@/components/comment-section/comment-form'
import CommentList from '@/components/comment-section/comment-list'
import { cn } from '@/lib/utils'

type CommentSectionProps = {
    className?: string
    postUuid: string
    postId: number
    username: string
}

export default function CommentSection({ className, postUuid, postId, username }: CommentSectionProps) {
    return (
        <section className={cn('flex-1 pb-6', className)} id={`comment-section-${postUuid}`}>
            <h4 className='text-lg font-semibold'>Comments</h4>
            <CommentForm postUuid={postUuid} parentId={postId} className='mt-3 pb-6 border-b border-border' />
            <CommentList postUuid={postUuid} postId={postId} username={username} />
        </section>
    )
}
