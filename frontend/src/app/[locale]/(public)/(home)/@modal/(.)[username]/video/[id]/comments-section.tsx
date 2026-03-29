'use client'

import CommentForm from '@/components/comment-section/comment-form'
import CommentList from '@/components/comment-section/comment-list'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useGetPostDetailQuery } from '@/store/services/posts.service'
import { X } from 'lucide-react'

interface CommentsSectionProps {
    id: string
    className?: string
    handleCloseComments: () => void
    isVisible: boolean
    username: string
}

export default function CommentsSection({
    id,
    className,
    handleCloseComments,
    username,
    isVisible
}: CommentsSectionProps) {
    const { data: postDetailRes } = useGetPostDetailQuery(id, { skip: !id })
    const postId = postDetailRes?.data.id

    return (
        <section
            className={cn(
                'flex-1 min-h-screen flex flex-col py-3 pl-3 bg-sidebar border-l overflow-hidden transition-all duration-700 ease-out',
                className,
                isVisible
                    ? 'w-96 max-w-92 pl-3 py-3 opacity-100 translate-x-0'
                    : 'w-0 max-w-0 p-0 opacity-0 translate-x-6 pointer-events-none'
            )}
        >
            <header className='flex justify-between items-center pe-3 h-[28px] '>
                <h4 className='text-base font-semibold'>Comments ({postDetailRes?.data?.comments_count ?? 0})</h4>
                <Button
                    variant='secondary'
                    className='size-7 aspect-square rounded-full shadow-xs cursor-pointer'
                    onClick={handleCloseComments}
                >
                    <X />
                </Button>
            </header>
            <div className='h-[calc(100vh-28px-53px-24px)] '>
                <CommentList postUuid={id} postId={postId ?? 0} username={username} />
            </div>
            <footer className=' pe-3 h-[53px] '>
                {postId ? <CommentForm postUuid={id} parentId={postId} className='mt-3' /> : null}
            </footer>
        </section>
    )
}
