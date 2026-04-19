'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useHidePostMutation } from '@/store/services/admin'
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
import { AlertCircle, Loader2 } from 'lucide-react'
import { VIOLATION_REASONS } from '@/constants/admin.const'

interface HidePostDialogProps {
    open: boolean
    postUuid: string
    authorUsername: string
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

/**
 * HidePostDialog - Modal dialog to hide a post
 * Collects: preset reason + optional custom reason
 */
export function HidePostDialog({ open, postUuid, authorUsername, onOpenChange, onSuccess }: HidePostDialogProps) {
    const t = useTranslations('AdminPage')
    const [hidePost, { isLoading }] = useHidePostMutation()

    const [formData, setFormData] = useState({
        reason: '',
        customReason: ''
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleCloseDialog = () => {
        setFormData({ reason: '', customReason: '' })
        setErrors({})
        onOpenChange(false)
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.reason) {
            newErrors.reason = t('posts.errors.reasonRequired')
        }

        if (formData.reason === 'other' && !formData.customReason.trim()) {
            newErrors.reason = t('posts.errors.reasonRequired')
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleHide = async () => {
        if (!validateForm()) return

        try {
            const selectedReason = VIOLATION_REASONS.find((reason) => reason.value === formData.reason)
            const finalReason =
                formData.reason === 'other'
                    ? formData.customReason.trim()
                    : `Violation: ${selectedReason?.label ?? formData.reason}`

            await hidePost({
                post_uuid: postUuid,
                reason: finalReason
            }).unwrap()

            toast.success(t('posts.messages.hideSuccess'))

            handleCloseDialog()
            onSuccess?.()
        } catch (error) {
            const errorMessage = (error as { data?: { message?: string } })?.data?.message
            toast.error(errorMessage || t('posts.messages.hideError'))
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[500px]'>
                <DialogHeader>
                    <div className='flex items-start gap-3'>
                        <AlertCircle className='w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0' />
                        <div>
                            <DialogTitle className='text-lg'>{t('posts.actions.hide')}</DialogTitle>
                            <DialogDescription className='mt-1'>
                                {t('posts.dialogs.hideSubtitle', { username: authorUsername })}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                    {/* Reason Select */}
                    <div className='space-y-2'>
                        <Label htmlFor='reason' className='text-sm font-semibold'>
                            {t('posts.labels.reason')}
                            <span className='text-red-600 ml-1'>*</span>
                        </Label>
                        <Select
                            value={formData.reason}
                            onValueChange={(value) => {
                                setFormData((prev) => ({ ...prev, reason: value, customReason: '' }))
                                if (errors.reason) setErrors((prev) => ({ ...prev, reason: '' }))
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('posts.placeholders.selectReason')} />
                            </SelectTrigger>
                            <SelectContent>
                                {VIOLATION_REASONS.map((reason) => (
                                    <SelectItem key={reason.value} value={reason.value}>
                                        {reason.label}
                                    </SelectItem>
                                ))}
                                <SelectItem value='other'>{t('posts.reasons.other')}</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.reason && <p className='text-sm text-red-600'>{errors.reason}</p>}
                    </div>

                    {/* Custom Reason (if "other" selected) */}
                    {formData.reason === 'other' && (
                        <div className='space-y-2'>
                            <Label htmlFor='customReason' className='text-sm font-semibold'>
                                {t('posts.labels.customReason')}
                            </Label>
                            <Textarea
                                id='customReason'
                                placeholder={t('posts.placeholders.customReason')}
                                value={formData.customReason}
                                onChange={(e) => setFormData((prev) => ({ ...prev, customReason: e.target.value }))}
                                className='min-h-[80px] resize-none'
                                disabled={isLoading}
                            />
                        </div>
                    )}
                </div>

                <DialogFooter className='gap-2 sm:gap-0'>
                    <Button type='button' variant='outline' onClick={handleCloseDialog} disabled={isLoading}>
                        {t('common.cancel')}
                    </Button>
                    <Button type='button' variant='default' onClick={handleHide} disabled={isLoading}>
                        {isLoading && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
                        {isLoading ? t('common.loading') : t('posts.actions.confirmHide')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
