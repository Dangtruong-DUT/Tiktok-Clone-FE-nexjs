'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
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
import { extractApiError } from '@/utils/extract-api-error'

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
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const resetForm = () => {
        setSubject('')
        setMessage('')
        setError('')
    }

    const handleClose = () => {
        resetForm()
        onOpenChange(false)
    }

    const validate = (): boolean => {
        if (subject.trim().length < 3) {
            setError(t('users.errors.subjectMinLength'))
            return false
        }
        if (message.trim().length < 10) {
            setError(t('users.errors.messageMinLength'))
            return false
        }
        return true
    }

    const handleSubmit = async () => {
        if (!validate()) return
        try {
            await sendMail({ user_uuid: userUuid, subject: subject.trim(), message: message.trim() }).unwrap()
            toast.success(t('users.messages.sendMailSuccess'))
            handleClose()
            onSuccess?.()
        } catch (err) {
            toast.error(extractApiError(err) ?? t('users.messages.sendMailError'))
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
                        <Input
                            id='mail-subject'
                            value={subject}
                            onChange={(e) => { setSubject(e.target.value); if (error) setError('') }}
                            disabled={isLoading}
                        />
                    </div>
                    <div className='space-y-2'>
                        <Label htmlFor='mail-message'>{t('users.labels.mailMessage')}</Label>
                        <Textarea
                            id='mail-message'
                            value={message}
                            onChange={(e) => { setMessage(e.target.value); if (error) setError('') }}
                            className='min-h-[140px] resize-none'
                            disabled={isLoading}
                        />
                    </div>
                    {error && <p className='text-sm text-red-600'>{error}</p>}
                </div>

                <DialogFooter className='gap-2'>
                    <Button type='button' variant='outline' onClick={handleClose} disabled={isLoading}>
                        {t('common.cancel')}
                    </Button>
                    <Button type='button' onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : t('users.actions.sendEmail')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
