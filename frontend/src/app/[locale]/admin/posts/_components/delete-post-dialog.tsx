'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { DeletePostFormSchema, type DeletePostFormValues } from '@/types/dtos/admin/post/admin-post.request.dto'
import { useDeletePostMutation } from '@/store/services/admin'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { VIOLATION_REASONS } from '@/constants/admin/ui'
import { extractApiErrorMessage } from '@/utils/errors/extract-api-error.util'

interface DeletePostDialogProps {
    open: boolean
    postUuid: string
    authorUsername: string
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function DeletePostDialog({ open, postUuid, authorUsername, onOpenChange, onSuccess }: DeletePostDialogProps) {
    const t = useTranslations('AdminPage')
    const [deletePost, { isLoading }] = useDeletePostMutation()

    const form = useForm<DeletePostFormValues>({
        resolver: zodResolver(DeletePostFormSchema),
        defaultValues: { reason: '', customReason: '' }
    })

    useEffect(() => {
        if (!open) form.reset()
    }, [open, form])

    const handleClose = () => onOpenChange(false)

    const selectedReason = form.watch('reason')

    const handleDelete = async (data: DeletePostFormValues) => {
        try {
            const violationReason = VIOLATION_REASONS.find((r) => r.value === data.reason)
            const finalReason =
                data.reason === 'other' ? data.customReason!.trim() : (violationReason?.value ?? data.reason)

            await deletePost({
                post_uuid: postUuid,
                reason: finalReason
            }).unwrap()

            toast.success(t('posts.messages.deleteSuccess'))

            handleClose()
            onSuccess?.()
        } catch (error) {
            toast.error(extractApiErrorMessage(error) ?? t('posts.messages.deleteError'))
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[500px]'>
                <DialogHeader>
                    <div>
                        <DialogTitle className='text-lg'>{t('posts.actions.delete')}</DialogTitle>
                        <DialogDescription className='mt-1'>
                            {t('posts.dialogs.deleteSubtitle', { username: authorUsername })}
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                    <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3'>
                        <p className='text-sm text-red-800 dark:text-red-200'>{t('posts.dialogs.deleteWarning')}</p>
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='reason' className='text-sm font-semibold'>
                            {t('posts.labels.reason')}
                            <span className='text-red-600 ml-1'>*</span>
                        </Label>
                        <Select
                            value={selectedReason}
                            onValueChange={(value) => {
                                form.setValue('reason', value, { shouldValidate: true })
                                form.setValue('customReason', '')
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('posts.placeholders.selectReason')} />
                            </SelectTrigger>
                            <SelectContent>
                                {VIOLATION_REASONS.map((reason) => (
                                    <SelectItem key={reason.value} value={reason.value}>
                                        {t(reason.labelKey as Parameters<typeof t>[0])}
                                    </SelectItem>
                                ))}
                                <SelectItem value='other'>{t('posts.reasons.other')}</SelectItem>
                            </SelectContent>
                        </Select>
                        {form.formState.errors.reason?.message && (
                            <p className='text-sm text-red-600'>{form.formState.errors.reason.message}</p>
                        )}
                    </div>

                    {selectedReason === 'other' && (
                        <div className='space-y-2'>
                            <Label htmlFor='customReason' className='text-sm font-semibold'>
                                {t('posts.labels.customReason')}
                            </Label>
                            <Textarea
                                id='customReason'
                                placeholder={t('posts.placeholders.customReason')}
                                {...form.register('customReason')}
                                className='min-h-[80px] resize-none'
                                disabled={isLoading}
                            />
                            {form.formState.errors.customReason?.message && (
                                <p className='text-sm text-red-600'>{form.formState.errors.customReason.message}</p>
                            )}
                        </div>
                    )}
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
                        {t('posts.actions.confirmDelete')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
