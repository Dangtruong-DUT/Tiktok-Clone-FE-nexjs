'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useDeleteCommentMutation } from '@/store/services/admin/index'
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

interface DeleteCommentDialogProps {
    open: boolean
    commentUuid: string
    authorUsername: string
    parentPostId?: number
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

/**
 * DeleteCommentDialog - Modal dialog to delete a comment
 * Collects: reason (required)
 */
export function DeleteCommentDialog({
    open,
    commentUuid,
    authorUsername,
    onOpenChange,
    onSuccess
}: DeleteCommentDialogProps) {
    const t = useTranslations('AdminPage')
    const [deleteComment, { isLoading }] = useDeleteCommentMutation()

    const [reason, setReason] = useState('')
    const [error, setError] = useState('')

    const handleCloseDialog = () => {
        setReason('')
        setError('')
        onOpenChange(false)
    }

    const validateForm = (): boolean => {
        if (!reason.trim()) {
            setError(t('comments.errors.reasonRequired'))
            return false
        }

        if (reason.trim().length < 10) {
            setError(t('comments.errors.reasonMinLength'))
            return false
        }

        return true
    }

    const handleDelete = async () => {
        if (!validateForm()) return

        try {
            await deleteComment({
                comment_uuid: commentUuid,
                reason: reason.trim()
            }).unwrap()

            toast.success(t('comments.messages.deleteSuccess'))

            handleCloseDialog()
            onSuccess?.()
        } catch (error) {
            const errorMessage = (error as { data?: { message?: string } })?.data?.message
            toast.error(errorMessage || t('comments.messages.deleteError'))
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
                    {/* Warning Box */}
                    <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3'>
                        <p className='text-sm text-red-800 dark:text-red-200'>{t('comments.dialogs.deleteWarning')}</p>
                    </div>

                    {/* Reason Field */}
                    <div className='space-y-2'>
                        <Label htmlFor='reason' className='text-sm font-semibold'>
                            {t('comments.labels.reason')}
                            <span className='text-red-600 ml-1'>*</span>
                        </Label>
                        <Textarea
                            id='reason'
                            placeholder={t('comments.placeholders.deleteReason')}
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value)
                                if (error) setError('')
                            }}
                            className='min-h-[100px] resize-none'
                            disabled={isLoading}
                        />
                        {error && <p className='text-sm text-red-600'>{error}</p>}
                    </div>
                </div>

                <DialogFooter className='gap-2 sm:gap-0'>
                    <Button type='button' variant='outline' onClick={handleCloseDialog} disabled={isLoading}>
                        {t('common.cancel')}
                    </Button>
                    <Button type='button' variant='destructive' onClick={handleDelete} disabled={isLoading}>
                        {isLoading ? t('common.loading') : t('comments.actions.confirmDelete')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
