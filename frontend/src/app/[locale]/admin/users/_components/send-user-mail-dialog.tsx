'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { SendMailFormSchema, type SendMailFormValues } from '@/types/dtos/admin/user/admin-user.request.dto'
import { useSendUserMailMutation } from '@/store/services/admin'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { extractApiErrorMessage } from '@/utils/errors/extract-api-error.util'

interface SendUserMailDialogProps {
    open: boolean
    userUuid: string
    username: string
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function SendUserMailDialog({ open, userUuid, username, onOpenChange, onSuccess }: SendUserMailDialogProps) {
    const t = useTranslations('AdminPage')
    const [sendMail, { isLoading }] = useSendUserMailMutation()

    const form = useForm<SendMailFormValues>({
        resolver: zodResolver(SendMailFormSchema),
        defaultValues: { subject: '', message: '' }
    })

    useEffect(() => {
        if (!open) form.reset()
    }, [open, form])

    const handleClose = () => onOpenChange(false)

    const handleSubmit = async (data: SendMailFormValues) => {
        try {
            await sendMail({ user_uuid: userUuid, subject: data.subject.trim(), message: data.message.trim() }).unwrap()
            toast.success(t('users.messages.sendMailSuccess'))
            handleClose()
            onSuccess?.()
        } catch (error) {
            toast.error(extractApiErrorMessage(error) ?? t('users.messages.sendMailError'))
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[560px]'>
                <DialogHeader>
                    <DialogTitle className='text-lg'>{t('users.actions.sendEmail')}</DialogTitle>
                    <DialogDescription className='mt-1'>
                        {t('users.dialogs.sendMailSubtitle', { username })}
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                    <div className='space-y-2'>
                        <Label htmlFor='mail-subject'>{t('users.labels.subject')}</Label>
                        <Input id='mail-subject' {...form.register('subject')} disabled={isLoading} />
                        {form.formState.errors.subject?.message && (
                            <p className='text-sm text-red-600'>{form.formState.errors.subject.message}</p>
                        )}
                    </div>
                    <div className='space-y-2'>
                        <Label htmlFor='mail-message'>{t('users.labels.mailMessage')}</Label>
                        <Textarea
                            id='mail-message'
                            {...form.register('message')}
                            className='min-h-[140px] resize-none'
                            disabled={isLoading}
                        />
                        {form.formState.errors.message?.message && (
                            <p className='text-sm text-red-600'>{form.formState.errors.message.message}</p>
                        )}
                    </div>
                </div>

                <DialogFooter className='gap-2'>
                    <Button type='button' variant='outline' onClick={handleClose} disabled={isLoading}>
                        {t('common.cancel')}
                    </Button>
                    <Button type='button' onClick={form.handleSubmit(handleSubmit)} disabled={isLoading}>
                        {isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : t('users.actions.sendEmail')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
