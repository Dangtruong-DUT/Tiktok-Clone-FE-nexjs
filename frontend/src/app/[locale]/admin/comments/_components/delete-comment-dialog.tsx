'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import {
    DeleteCommentFormSchema,
    type DeleteCommentFormValues
} from '@/types/dtos/admin/comment/admin-comment.request.dto'
import { useDeleteCommentMutation } from '@/store/services/admin'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { extractApiErrorMessage } from '@/utils/errors/extract-api-error.util'

interface DeleteCommentDialogProps {
    open: boolean
    commentUuid: string
    authorUsername: string
    parentPostId?: number
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function DeleteCommentDialog({
    open,
    commentUuid,
    authorUsername,
    onOpenChange,
    onSuccess
}: DeleteCommentDialogProps) {
    const t = useTranslations('AdminPage')
    const [deleteComment, { isLoading }] = useDeleteCommentMutation()

    const form = useForm<DeleteCommentFormValues>({
        resolver: zodResolver(DeleteCommentFormSchema),
        defaultValues: { reason: '' }
    })

    useEffect(() => {
        if (!open) form.reset()
    }, [open, form])

    const handleClose = () => onOpenChange(false)

    const handleDelete = async (data: DeleteCommentFormValues) => {
        try {
            await deleteComment({
                comment_uuid: commentUuid,
                reason: data.reason
            }).unwrap()

            toast.success(t('comments.messages.deleteSuccess'))

            handleClose()
            onSuccess?.()
        } catch (error) {
            toast.error(extractApiErrorMessage(error) ?? t('comments.messages.deleteError'))
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[500px]'>
                <DialogHeader>
                    <div>
                        <DialogTitle className='text-lg'>{t('comments.actions.delete')}</DialogTitle>
                        <DialogDescription className='mt-1'>
                            {t('comments.dialogs.deleteSubtitle', { username: authorUsername })}
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                    <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3'>
                        <p className='text-sm text-red-800 dark:text-red-200'>{t('comments.dialogs.deleteWarning')}</p>
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='reason' className='text-sm font-semibold'>
                            {t('comments.labels.reason')}
                            <span className='text-red-600 ml-1'>*</span>
                        </Label>
                        <Textarea
                            id='reason'
                            placeholder={t('comments.placeholders.deleteReason')}
                            {...form.register('reason')}
                            className='min-h-[100px] resize-none'
                            disabled={isLoading}
                        />
                        {form.formState.errors.reason?.message && (
                            <p className='text-sm text-red-600'>{form.formState.errors.reason.message}</p>
                        )}
                    </div>
                </div>

                <DialogFooter className='gap-2'>
                    <Button size='lg' type='button' variant='outline' onClick={handleClose} disabled={isLoading}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        size='lg'
                        type='button'
                        variant='destructive'
                        isLoading={isLoading}
                        onClick={form.handleSubmit(handleDelete)}
                    >
                        {t('comments.actions.confirmDelete')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
