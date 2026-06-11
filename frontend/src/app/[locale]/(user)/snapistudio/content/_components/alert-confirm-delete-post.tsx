'use client'

import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useDeletePostMutation } from '@/store/services/content/posts.service'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { extractApiErrorMessage } from '@/utils/errors/extract-api-error.util'

export default function AlertDialogDeletePost({
    postIdDelete,
    setPostIdDelete
}: {
    postIdDelete: string | null
    setPostIdDelete: (value: string | null) => void
}) {
    const t = useTranslations('SnapiStudio.content.table')
    const [deletePostMutate, { isLoading }] = useDeletePostMutation()

    const handleDelete = useCallback(async () => {
        if (!postIdDelete) return
        try {
            const res = await deletePostMutate(postIdDelete).unwrap()
            toast.success(res.message)
            setPostIdDelete(null)
        } catch (error) {
            toast.error(extractApiErrorMessage(error) ?? t('deleteDialog.failed'))
        }
    }, [deletePostMutate, postIdDelete, setPostIdDelete, t])

    return (
        <ConfirmDialog
            open={Boolean(postIdDelete)}
            onOpenChange={(open) => {
                if (!open) setPostIdDelete(null)
            }}
            title={t('deleteDialog.title')}
            description={t('deleteDialog.description')}
            confirmLabel={t('deleteDialog.confirm')}
            isLoading={isLoading}
            onConfirm={handleDelete}
            confirmClassName='bg-destructive text-white hover:bg-destructive/90'
        />
    )
}
