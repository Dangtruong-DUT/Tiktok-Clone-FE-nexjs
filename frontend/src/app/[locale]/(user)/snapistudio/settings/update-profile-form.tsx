'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader, Pencil, UserIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { UpdateUserBody, UpdateUserBodyType } from '@/types/dtos/user/user-request.dto'
import useCurrentUserData from '@/hooks/data/useCurrentUserData'
import { useUpdateMeMutation } from '@/store/services/user.service'
import { useUploadImageMutation } from '@/store/services/upload.service'
import { handleFormError } from '@/utils/handleErrors/handleFormErrors.util'
import PhotoEditorDialog from '@/components/photo-editor-dialog'
import { getAcceptedFileAttribute, validateUploadFile } from '@/utils/validation/upload-file.util'

export default function UpdateProfileForm() {
    const t = useTranslations('SnapiStudio.settings')
    const [fileImage, setFileImage] = useState<File | null>(null)
    const avatarPreviewRef = useRef<HTMLInputElement>(null)
    const [isPhotoEditorVisible, setIsPhotoEditorVisible] = useState<boolean>(false)

    const [updateProfileMutateAsync, { isLoading: isUpdatingProfile }] = useUpdateMeMutation()
    const [uploadImageMutateAsync, { isLoading: isUploadingAvatar }] = useUploadImageMutation()

    const form = useForm<UpdateUserBodyType>({
        resolver: zodResolver(UpdateUserBody),
        defaultValues: {
            name: ''
        },
        mode: 'onChange'
    })

    const user = useCurrentUserData()

    useEffect(() => {
        form.reset({
            name: user?.name || ''
        })
    }, [user, form])

    const isLoading = isUploadingAvatar || isUpdatingProfile

    const handleSubmit = useCallback(
        async (data: UpdateUserBodyType) => {
            if (isLoading) return

            try {
                const payload: UpdateUserBodyType = {
                    ...data
                }

                if (fileImage) {
                    const formData = new FormData()
                    formData.append('file', fileImage)
                    const uploadResponse = await uploadImageMutateAsync(formData).unwrap()
                    payload.avatar_file_id = uploadResponse.data.id
                }

                const updateProfileRes = await updateProfileMutateAsync(payload).unwrap()
                const { name } = updateProfileRes.data

                form.reset({
                    name
                })
                toast.success(updateProfileRes.message)
            } catch (error) {
                handleFormError<UpdateUserBodyType>({
                    error: error,
                    setFormError: form.setError
                })
            }
        },
        [form, uploadImageMutateAsync, updateProfileMutateAsync, isLoading, fileImage]
    )

    const avatarSrc = useMemo(
        () => (fileImage != null ? URL.createObjectURL(fileImage) : (user?.avatar ?? undefined)),
        [fileImage, user?.avatar]
    )

    const handleChangeAvatar = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null
        if (!selectedFile) {
            e.target.value = ''
            return
        }

        const validation = validateUploadFile(selectedFile, 'image')
        if (!validation.isValid) {
            if (validation.code === 'invalid_type') {
                toast.error(
                    t('updateProfile.validation.invalidType', {
                        accepted: validation.acceptedExtensions
                    })
                )
            } else {
                toast.error(
                    t('updateProfile.validation.tooLarge', {
                        maxSizeMb: validation.maxSizeMb
                    })
                )
            }
            e.target.value = ''
            return
        }

        setFileImage(selectedFile)

        if (selectedFile) {
            setIsPhotoEditorVisible(true)
        }
        e.target.value = ''
    }, [])

    if (!user) {
        return (
            <div className='space-y-6'>
                <div className='flex items-start justify-between gap-4'>
                    <div className='flex items-center gap-2'>
                        <Skeleton className='size-9 rounded-full' />
                        <div className='space-y-2'>
                            <Skeleton className='h-4 w-32' />
                            <Skeleton className='h-3 w-56' />
                        </div>
                    </div>
                    <Skeleton className='h-9 w-[90px] rounded-full' />
                </div>

                <div className='grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center'>
                    <Skeleton className='h-[112px] w-[112px] rounded-full' />
                    <div className='grid gap-3'>
                        <Skeleton className='h-4 w-32' />
                        <Skeleton className='h-11 w-full rounded-full' />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Form {...form}>
            <PhotoEditorDialog
                setVisible={setIsPhotoEditorVisible}
                isVisible={isPhotoEditorVisible}
                photoUrl={avatarSrc!}
                onConfirm={setFileImage}
            />
            <form
                noValidate
                className='grid auto-rows-max items-start gap-6'
                onSubmit={form.handleSubmit(handleSubmit)}
                method='POST'
            >
                <div className='space-y-6'>
                    <div className='flex items-start justify-between gap-4'>
                        <div className='flex items-center gap-2'>
                            <div className='p-2 rounded-full bg-brand/10'>
                                <UserIcon className='w-5 h-5 text-brand' />
                            </div>
                            <div>
                                <h3 className='font-semibold'>{t('updateProfile.title')}</h3>
                                <p className='text-sm text-muted-foreground'>{t('updateProfile.description')}</p>
                            </div>
                        </div>
                        <Button
                            size='sm'
                            type='submit'
                            disabled={isLoading}
                            className='bg-brand hover:bg-brand/90 min-w-[90px] rounded-full flex items-center justify-center [&_svg]:size-5! cursor-pointer text-white'
                        >
                            {isLoading ? <Loader className='animate-spin' /> : t('updateProfile.save')}
                        </Button>
                    </div>

                    <div className='grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center'>
                        <FormField
                            control={form.control}
                            name='avatar_file_id'
                            render={({}) => (
                                <FormItem>
                                    <div className='relative h-[112px] w-[112px]'>
                                        <Avatar className='h-full w-full rounded-full border-2 border-brand/20'>
                                            <AvatarImage src={avatarSrc} className='shrink-0 object-cover' />
                                            <AvatarFallback>
                                                {user?.name.split(' ').at(-1) || t('updateProfile.defaultUser')}
                                            </AvatarFallback>
                                        </Avatar>

                                        <input
                                            type='file'
                                            accept={getAcceptedFileAttribute('image')}
                                            className='hidden'
                                            ref={avatarPreviewRef}
                                            onChange={handleChangeAvatar}
                                        />

                                        <Button
                                            type='button'
                                            size='icon'
                                            className='absolute bottom-0 right-0 h-8 w-8 rounded-full bg-brand hover:bg-brand/90 text-white'
                                            onClick={() => {
                                                avatarPreviewRef.current?.click()
                                            }}
                                        >
                                            <Pencil className='h-4 w-4' />
                                            <span className='sr-only'>{t('updateProfile.upload')}</span>
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                                <FormItem>
                                    <div className='grid gap-3'>
                                        <Label htmlFor='name' className='font-semibold text-muted-foreground'>
                                            {t('updateProfile.fullNameLabel')}
                                        </Label>
                                        <Input
                                            id='name'
                                            type='text'
                                            className='brand-input bg-muted! border-none!'
                                            {...field}
                                        />
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            </form>
        </Form>
    )
}
