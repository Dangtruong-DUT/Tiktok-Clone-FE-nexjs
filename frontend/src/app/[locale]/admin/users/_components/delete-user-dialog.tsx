'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { DeleteUserFormSchema, type DeleteUserFormValues } from '@/types/dtos/admin/user/admin-user.request.dto'
import { useDeleteUserMutation } from '@/store/services/admin'
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
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { extractApiErrorMessage } from '@/utils/handleErrors/extractApiError.util'

interface DeleteUserDialogProps {
    open: boolean
    userUuid: string
    username: string
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function DeleteUserDialog({ open, userUuid, username, onOpenChange, onSuccess }: DeleteUserDialogProps) {
    const t = useTranslations('AdminPage')
    const [deleteUser, { isLoading }] = useDeleteUserMutation()

    const form = useForm<DeleteUserFormValues>({
        resolver: zodResolver(DeleteUserFormSchema),
        defaultValues: { reason: '' }
    })

    useEffect(() => {
        if (!open) form.reset()
    }, [open, form])

    const handleClose = () => onOpenChange(false)

    const handleDelete = async (data: DeleteUserFormValues) => {
        try {
            await deleteUser({
                user_uuid: userUuid,
                reason: data.reason
            }).unwrap()

            toast.success(t('users.messages.deleteSuccess'))

            handleClose()
            onSuccess?.()
        } catch (error) {
            toast.error(extractApiErrorMessage(error) ?? t('users.messages.deleteError'))
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[500px]'>
                <DialogHeader>
                    <div>
                        <DialogTitle className='text-lg'>{t('users.dialogs.deleteTitle')}</DialogTitle>
                        <DialogDescription className='mt-1'>
                            {t('users.dialogs.deleteSubtitle', { username })}
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                    <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3'>
                        <p className='text-sm text-yellow-800 dark:text-yellow-200'>
                            {t('users.dialogs.deleteWarning')}
                        </p>
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='reason' className='text-sm font-semibold'>
                            {t('users.labels.reason')}
                            <span className='text-red-600 ml-1'>*</span>
                        </Label>
                        <Textarea
                            id='reason'
                            placeholder={t('users.placeholders.deleteReason')}
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
                    <Button type='button' variant='outline' onClick={handleClose} disabled={isLoading}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        type='button'
                        variant='destructive'
                        onClick={form.handleSubmit(handleDelete)}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : t('users.actions.confirmDelete')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
