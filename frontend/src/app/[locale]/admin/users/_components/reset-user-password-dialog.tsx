'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { ResetPasswordFormSchema, type ResetPasswordFormValues } from '@/types/dtos/admin/user/admin-user.request.dto'
import { useResetUserPasswordMutation } from '@/store/services/admin'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { toast } from 'sonner'
import { extractApiErrorMessage } from '@/utils/errors/extract-api-error.util'

interface ResetUserPasswordDialogProps {
    open: boolean
    userUuid: string
    username: string
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function ResetUserPasswordDialog({
    open,
    userUuid,
    username,
    onOpenChange,
    onSuccess
}: ResetUserPasswordDialogProps) {
    const t = useTranslations('AdminPage')
    const [resetPassword, { isLoading }] = useResetUserPasswordMutation()

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(ResetPasswordFormSchema),
        defaultValues: { password: '', confirmPassword: '' }
    })

    useEffect(() => {
        if (!open) form.reset()
    }, [open, form])

    const handleClose = () => onOpenChange(false)

    const handleSubmit = async (data: ResetPasswordFormValues) => {
        try {
            await resetPassword({
                user_uuid: userUuid,
                password: data.password,
                confirm_password: data.confirmPassword
            }).unwrap()

            toast.success(t('users.messages.resetPasswordSuccess'))
            handleClose()
            onSuccess?.()
        } catch (error) {
            toast.error(extractApiErrorMessage(error) ?? t('users.messages.resetPasswordError'))
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[500px]'>
                <DialogHeader>
                    <div>
                        <DialogTitle className='text-lg'>{t('users.dialogs.resetPasswordTitle')}</DialogTitle>
                        <DialogDescription className='mt-1'>
                            {t('users.dialogs.resetPasswordSubtitle', { username })}
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                    <div className='space-y-2'>
                        <Label htmlFor='new-password'>{t('users.labels.newPassword')}</Label>
                        <PasswordInput id='new-password' {...form.register('password')} disabled={isLoading} />
                        {form.formState.errors.password?.message && (
                            <p className='text-sm text-red-600'>{form.formState.errors.password.message}</p>
                        )}
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='confirm-password'>{t('users.labels.confirmPassword')}</Label>
                        <PasswordInput
                            id='confirm-password'
                            {...form.register('confirmPassword')}
                            disabled={isLoading}
                        />
                        {form.formState.errors.confirmPassword?.message && (
                            <p className='text-sm text-red-600'>{form.formState.errors.confirmPassword.message}</p>
                        )}
                    </div>
                </div>

                <DialogFooter className='gap-2'>
                    <Button size='lg' type='button' variant='outline' onClick={handleClose} disabled={isLoading}>
                        {t('common.cancel')}
                    </Button>
                    <Button size='lg' type='button' variant='brand' isLoading={isLoading} onClick={form.handleSubmit(handleSubmit)}>
                        {t('users.actions.resetPassword')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
