'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { BanUserFormSchema, type BanUserFormValues } from '@/types/dtos/admin/user/admin-user.request.dto'
import { useBanUserMutation } from '@/store/services/admin'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { extractApiError } from '@/utils/extract-api-error'

interface BanUserDialogProps {
    open: boolean
    userUuid: string
    username: string
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function BanUserDialog({ open, userUuid, username, onOpenChange, onSuccess }: BanUserDialogProps) {
    const t = useTranslations('AdminPage')
    const [banUser, { isLoading }] = useBanUserMutation()

    const form = useForm<BanUserFormValues>({
        resolver: zodResolver(BanUserFormSchema),
        defaultValues: { reason: '', durationDays: '' }
    })

    useEffect(() => {
        if (!open) form.reset()
    }, [open, form])

    const handleClose = () => onOpenChange(false)

    const handleBan = async (data: BanUserFormValues) => {
        try {
            const request = {
                user_uuid: userUuid,
                reason: data.reason,
                duration_days: data.durationDays ? Number(data.durationDays) : undefined
            }

            await banUser(request).unwrap()

            toast.success(t('users.messages.banSuccess'))

            handleClose()
            onSuccess?.()
        } catch (error) {
            toast.error(extractApiError(error) ?? t('users.messages.banError'))
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[500px]'>
                <DialogHeader>
                    <div>
                        <DialogTitle className='text-lg'>{t('users.actions.ban')}</DialogTitle>
                        <DialogDescription className='mt-1'>
                            {t('users.banDialog.subtitle', { username })}
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                    <div className='space-y-2'>
                        <Label htmlFor='reason' className='text-sm font-semibold'>
                            {t('users.labels.reason')}
                            <span className='text-red-600 ml-1'>*</span>
                        </Label>
                        <Textarea
                            id='reason'
                            placeholder={t('users.placeholders.banReason')}
                            {...form.register('reason')}
                            className='min-h-[100px] resize-none'
                            disabled={isLoading}
                        />
                        {form.formState.errors.reason?.message && (
                            <p className='text-sm text-red-600'>{form.formState.errors.reason.message}</p>
                        )}
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='duration' className='text-sm font-semibold'>
                            {t('users.labels.duration')}
                        </Label>
                        <Input
                            id='duration'
                            type='number'
                            placeholder={t('users.placeholders.duration')}
                            {...form.register('durationDays')}
                            min='1'
                            max='365'
                            disabled={isLoading}
                        />
                        <p className='text-xs text-muted-foreground'>{t('users.hints.durationHint')}</p>
                        {form.formState.errors.durationDays?.message && (
                            <p className='text-sm text-red-600'>{form.formState.errors.durationDays.message}</p>
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
                        onClick={form.handleSubmit(handleBan)}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : t('users.actions.confirmBan')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
