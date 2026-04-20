'use client'

import { useState } from 'react'
import { useResetUserPasswordMutation } from '@/store/services/admin/index'
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
import { KeyRound, Loader2 } from 'lucide-react'

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
    const [resetPassword, { isLoading }] = useResetUserPasswordMutation()
    const [password, setPassword] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [error, setError] = useState('')

    const resetForm = () => {
        setPassword('')
        setPasswordConfirmation('')
        setError('')
    }

    const handleClose = () => {
        resetForm()
        onOpenChange(false)
    }

    const validate = (): boolean => {
        if (password.length < 8) {
            setError('Password must be at least 8 characters')
            return false
        }

        if (password !== passwordConfirmation) {
            setError('Password confirmation does not match')
            return false
        }

        return true
    }

    const handleSubmit = async () => {
        if (!validate()) return

        try {
            await resetPassword({
                user_uuid: userUuid,
                password,
                confirm_password: passwordConfirmation
            }).unwrap()

            toast.success('User password reset successfully')
            handleClose()
            onSuccess?.()
        } catch (error) {
            const errorMessage = (error as { data?: { message?: string } })?.data?.message
            toast.error(errorMessage || 'Failed to reset user password')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[500px]'>
                <DialogHeader>
                    <div className='flex items-start gap-3'>
                        <KeyRound className='w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0' />
                        <div>
                            <DialogTitle className='text-lg'>Reset User Password</DialogTitle>
                            <DialogDescription className='mt-1'>
                                Set a new password for <strong>{username}</strong>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                    <div className='space-y-2'>
                        <Label htmlFor='new-password'>New password</Label>
                        <PasswordInput
                            id='new-password'
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value)
                                if (error) setError('')
                            }}
                            disabled={isLoading}
                        />
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='confirm-password'>Confirm password</Label>
                        <PasswordInput
                            id='confirm-password'
                            value={passwordConfirmation}
                            onChange={(e) => {
                                setPasswordConfirmation(e.target.value)
                                if (error) setError('')
                            }}
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
                        {isLoading && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
                        {isLoading ? 'Saving...' : 'Reset Password'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
