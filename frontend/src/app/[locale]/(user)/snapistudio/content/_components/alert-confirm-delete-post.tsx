'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'
import { useDeletePostMutation } from '@/store/services/posts.service'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { extractApiErrorMessage } from '@/utils/errors/extract-api-error.util'

export default function AlertDialogDeleteDish({
    postIdDelete,
    setPostIdDelete
}: {
    postIdDelete: string | null
    setPostIdDelete: (value: string | null) => void
}) {
    const [deletePostMutate, { isLoading }] = useDeletePostMutation()

    const handleDelete = useCallback(async () => {
        if (!postIdDelete) return
        try {
            const res = await deletePostMutate(postIdDelete).unwrap()
            toast.success(res.message)
            setPostIdDelete(null)
        } catch (error) {
            toast.error(extractApiErrorMessage(error) ?? 'Failed to delete post')
        }
    }, [deletePostMutate, postIdDelete, setPostIdDelete])

    return (
        <ConfirmDialog
            open={Boolean(postIdDelete)}
            onOpenChange={(open) => {
                if (!open) setPostIdDelete(null)
            }}
            title='Delete Post?'
            description="Are you certain you want to delete this post? Once deleted, you won't be able to recover it."
            confirmLabel='Delete'
            isLoading={isLoading}
            onConfirm={handleDelete}
            confirmClassName='bg-destructive text-white hover:bg-destructive/90'
        />
    )
}
