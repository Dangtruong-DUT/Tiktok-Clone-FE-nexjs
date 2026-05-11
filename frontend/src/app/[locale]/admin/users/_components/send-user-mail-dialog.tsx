'use client'

import { useState } from 'react'
import { useSendUserMailMutation } from '@/store/services/admin/index'
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
import { toast } from 'sonner'

interface SendUserMailDialogProps {
    open: boolean
    userUuid: string
    username: string
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function SendUserMailDialog({ open, userUuid, username, onOpenChange, onSuccess }: SendUserMailDialogProps) {
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
            setError('Subject must be at least 3 characters')
            return false
        }

        if (message.trim().length < 10) {
            setError('Message must be at least 10 characters')
            return false
        }

        return true
    }

    const handleSubmit = async () => {
        if (!validate()) return

        try {
            await sendMail({
                user_uuid: userUuid,
                subject: subject.trim(),
                message: message.trim()
            }).unwrap()

            toast.success('Email sent successfully')
            handleClose()
            onSuccess?.()
        } catch (error) {
            const errorMessage = (error as { data?: { message?: string } })?.data?.message
            toast.error(errorMessage || 'Failed to send email')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[560px]'>
                <DialogHeader>
                    <div>
                        <DialogTitle className='text-lg'>Send Email</DialogTitle>
                        <DialogDescription className='mt-1'>
                            Send a direct email to <strong>{username}</strong>
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                    <div className='space-y-2'>
                        <Label htmlFor='mail-subject'>Subject</Label>
                        <Input
                            id='mail-subject'
                            value={subject}
                            onChange={(e) => {
                                setSubject(e.target.value)
                                if (error) setError('')
                            }}
                            disabled={isLoading}
                        />
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='mail-message'>Message</Label>
                        <Textarea
                            id='mail-message'
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value)
                                if (error) setError('')
                            }}
                            className='min-h-[140px] resize-none'
                            disabled={isLoading}
                        />
                    </div>

                    {error && <p className='text-sm text-red-600'>{error}</p>}
                </div>

                <DialogFooter className='gap-2 sm:gap-0'>
                    <Button type='button' variant='outline' onClick={handleClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type='button' onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? 'Sending...' : 'Send Email'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
