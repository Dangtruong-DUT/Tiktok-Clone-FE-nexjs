'use client'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { LockIcon } from 'lucide-react'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { handleFormError } from '@/utils/errors/handle-form-errors.util'
import { ChangePasswordBody, ChangePasswordBodyType } from '@/types/dtos/user/user-request.dto'
import { useChangePasswordMutation } from '@/store/services/user/user.service'
import { Link } from '@/i18n/navigation'
import { AUTH_ROUTES } from '@/constants/routes/routes'

export default function ChangePasswordForm() {
    const t = useTranslations('SnapiStudio.settings')
    const [changePasswordMutate, changePasswordResult] = useChangePasswordMutation()

    const form = useForm<ChangePasswordBodyType>({
        resolver: zodResolver(ChangePasswordBody),
        defaultValues: {
            current_password: '',
            password: '',
            confirm_password: ''
        }
    })

    const handleSubmit = useCallback(
        async (data: ChangePasswordBodyType) => {
            if (changePasswordResult.isLoading) return
            try {
                const res = await changePasswordMutate(data).unwrap()
                toast.success(res.message)
                form.reset()
            } catch (error) {
                handleFormError<ChangePasswordBodyType>({
                    error: error,
                    setFormError: form.setError
                })
            }
        },
        [form, changePasswordMutate, changePasswordResult]
    )
    const onReset = () => {
        form.reset()
    }

    return (
        <Form {...form}>
            <form
                noValidate
                className='grid auto-rows-max items-start gap-4 md:gap-8'
                onSubmit={form.handleSubmit(handleSubmit)}
                onReset={onReset}
                method='POST'
            >
                <div>
                    <div className='flex items-center gap-2 mb-6'>
                        <div className='p-2 rounded-full bg-brand/10'>
                            <LockIcon className='w-5 h-5 text-brand' />
                        </div>
                        <div>
                            <h3 className='font-semibold'>{t('changePassword.title')}</h3>
                            <p className='text-sm text-muted-foreground'>{t('changePassword.description')}</p>
                        </div>
                    </div>
                    <div className='space-y-6'>
                        <div className='grid gap-6'>
                            <FormField
                                control={form.control}
                                name='current_password'
                                render={({ field }) => (
                                    <FormItem>
                                        <div className='grid gap-3'>
                                            <Label
                                                htmlFor='oldPassword'
                                                className='font-semibold text-muted-foreground'
                                            >
                                                {t('changePassword.oldPassword')}
                                            </Label>
                                            <PasswordInput id='oldPassword' className='' {...field} />
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <div className='-mt-3'>
                                <Button asChild variant='link' size='sm' className='h-auto px-0 text-muted-foreground'>
                                    <Link href={AUTH_ROUTES.FORGOT_PASSWORD}>{t('changePassword.forgotPassword')}</Link>
                                </Button>
                            </div>
                            <FormField
                                control={form.control}
                                name='password'
                                render={({ field }) => (
                                    <FormItem>
                                        <div className='grid gap-3'>
                                            <Label htmlFor='password' className='font-semibold text-muted-foreground'>
                                                {t('changePassword.newPassword')}
                                            </Label>
                                            <PasswordInput id='password' className='' {...field} />
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='confirm_password'
                                render={({ field }) => (
                                    <FormItem>
                                        <div className='grid gap-3'>
                                            <Label
                                                htmlFor='confirmPassword'
                                                className='font-semibold text-muted-foreground'
                                            >
                                                {t('changePassword.confirmPassword')}
                                            </Label>
                                            <PasswordInput id='confirmPassword' className='' {...field} />
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <div className='items-center gap-2 md:ml-auto flex flex-wrap'>
                                <Button variant='outline' size='lg' type='reset' className='min-w-[100px]'>
                                    {t('changePassword.cancel')}
                                </Button>
                                <Button
                                    size='lg'
                                    type='submit'
                                    variant='brand'
                                    isLoading={changePasswordResult.isLoading}
                                    className='min-w-[100px]'
                                >
                                    {t('changePassword.save')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    )
}
