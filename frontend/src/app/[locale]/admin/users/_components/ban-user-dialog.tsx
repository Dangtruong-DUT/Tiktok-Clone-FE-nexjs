'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
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

    const [formData, setFormData] = useState({
        reason: '',
        durationDays: ''
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleCloseDialog = () => {
        setFormData({ reason: '', durationDays: '' })
        setErrors({})
        onOpenChange(false)
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.reason.trim()) {
            newErrors.reason = t('users.errors.reasonRequired')
        } else if (formData.reason.trim().length < 10) {
            newErrors.reason = t('users.errors.reasonMinLength')
        }

        if (formData.durationDays && (isNaN(Number(formData.durationDays)) || Number(formData.durationDays) < 1)) {
            newErrors.durationDays = t('users.errors.durationInvalid')
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleBan = async () => {
        if (!validateForm()) return

        try {
            const request = {
                user_uuid: userUuid,
                reason: formData.reason.trim(),
                duration_days: formData.durationDays ? Number(formData.durationDays) : undefined
            }

            await banUser(request).unwrap()

            toast.success(t('users.messages.banSuccess'))

            handleCloseDialog()
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
                    {/* Reason Field */}
                    <div className='space-y-2'>
                        <Label htmlFor='reason' className='text-sm font-semibold'>
                            {t('users.labels.reason')}
                            <span className='text-red-600 ml-1'>*</span>
                        </Label>
                        <Textarea
                            id='reason'
                            placeholder={t('users.placeholders.banReason')}
                            value={formData.reason}
                            onChange={(e) => {
                                setFormData((prev) => ({ ...prev, reason: e.target.value }))
                                if (errors.reason) setErrors((prev) => ({ ...prev, reason: '' }))
                            }}
                            className='min-h-[100px] resize-none'
                            disabled={isLoading}
                        />
                        {errors.reason && <p className='text-sm text-red-600'>{errors.reason}</p>}
                    </div>

                    {/* Duration Field */}
                    <div className='space-y-2'>
                        <Label htmlFor='duration' className='text-sm font-semibold'>
                            {t('users.labels.duration')}
                        </Label>
                        <Input
                            id='duration'
                            type='number'
                            placeholder={t('users.placeholders.duration')}
                            value={formData.durationDays}
                            onChange={(e) => {
                                setFormData((prev) => ({ ...prev, durationDays: e.target.value }))
                                if (errors.durationDays) setErrors((prev) => ({ ...prev, durationDays: '' }))
                            }}
                            min='1'
                            max='365'
                            disabled={isLoading}
                        />
                        <p className='text-xs text-muted-foreground'>{t('users.hints.durationHint')}</p>
                        {errors.durationDays && <p className='text-sm text-red-600'>{errors.durationDays}</p>}
                    </div>
                </div>

                <DialogFooter className='gap-2'>
                    <Button type='button' variant='outline' onClick={handleCloseDialog} disabled={isLoading}>
                        {t('common.cancel')}
                    </Button>
                    <Button type='button' variant='destructive' onClick={handleBan} disabled={isLoading}>
                        {isLoading ? t('common.loading') : t('users.actions.confirmBan')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
