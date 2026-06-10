'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Camera } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { UpdateUserBody, UpdateUserBodyType } from '@/types/dtos/user/user-request.dto'
import useCurrentUserData from '@/hooks/data/useCurrentUserData'
import { useUpdateMeMutation } from '@/store/services/user.service'
import { useUploadImageMutation } from '@/store/services/upload.service'
import { handleFormError } from '@/utils/errors/handle-form-errors.util'
import PhotoEditorDialog from '@/components/photo-editor-dialog'
import { getAcceptedFileAttribute, validateUploadFile } from '@/utils/validation/upload-file.util'

export default function UpdateProfileForm() {
    const t = useTranslations('SnapiStudio.settings')
    const [fileImage, setFileImage] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined)
    const avatarPreviewRef = useRef<HTMLInputElement>(null)
    const [isPhotoEditorVisible, setIsPhotoEditorVisible] = useState<boolean>(false)

    const [updateProfileMutateAsync, { isLoading: isUpdatingProfile }] = useUpdateMeMutation()
    const [uploadImageMutateAsync, { isLoading: isUploadingAvatar }] = useUploadImageMutation()

    const form = useForm<UpdateUserBodyType>({
        resolver: zodResolver(UpdateUserBody),
        defaultValues: {
            name: '',
            bio: '',
            username: ''
        },
        mode: 'onChange'
    })

    const user = useCurrentUserData()

    useEffect(() => {
        form.reset({
            name: user?.name || '',
            bio: user?.bio || '',
            username: user?.username || ''
        })
    }, [user, form])

    useEffect(() => {
        if (!fileImage) {
            setAvatarPreview(user?.avatar ?? undefined)
            return
        }

        const nextPreview = URL.createObjectURL(fileImage)
        setAvatarPreview(nextPreview)

        return () => URL.revokeObjectURL(nextPreview)
    }, [fileImage, user?.avatar])

    const isLoading = isUploadingAvatar || isUpdatingProfile

    const handleSubmit = useCallback(
        async (data: UpdateUserBodyType) => {
            if (isLoading) return

            try {
                const payload: UpdateUserBodyType = { ...data }

                if (fileImage) {
                    const formData = new FormData()
                    formData.append('file', fileImage)
                    const uploadResponse = await uploadImageMutateAsync(formData).unwrap()
                    payload.avatar_file_id = uploadResponse.data.id
                }

                const updateProfileRes = await updateProfileMutateAsync(payload).unwrap()
                const { name, bio, username } = updateProfileRes.data

                form.reset({ name, bio: bio || '', username: username || '' })
                setFileImage(null)
                setAvatarPreview(updateProfileRes.data.avatar ?? undefined)
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

    const handleChangeAvatar = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const selectedFile = e.target.files?.[0] || null
            if (!selectedFile) {
                e.target.value = ''
                return
            }

            const validation = validateUploadFile(selectedFile, 'image')
            if (!validation.isValid) {
                if (validation.code === 'invalid_type') {
                    toast.error(t('updateProfile.validation.invalidType', { accepted: validation.acceptedExtensions }))
                } else {
                    toast.error(t('updateProfile.validation.tooLarge', { maxSizeMb: validation.maxSizeMb }))
                }
                e.target.value = ''
                return
            }

            setFileImage(selectedFile)
            if (selectedFile) setIsPhotoEditorVisible(true)
            e.target.value = ''
        },
        [t]
    )

    if (!user) {
        return (
            <div className='space-y-6'>
                <div className='flex flex-col items-center gap-3'>
                    <Skeleton className='size-24 rounded-full' />
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-3 w-32' />
                </div>
                <div className='space-y-4'>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className='space-y-1.5'>
                            <Skeleton className='h-3.5 w-20' />
                            <Skeleton className='h-10 w-full rounded-xl' />
                        </div>
                    ))}
                </div>
                <Skeleton className='h-11 w-full rounded-full' />
            </div>
        )
    }

    return (
        <Form {...form}>
            <PhotoEditorDialog
                setVisible={setIsPhotoEditorVisible}
                isVisible={isPhotoEditorVisible}
                photoUrl={avatarPreview ?? user?.avatar ?? ''}
                onConfirm={setFileImage}
            />
            <form noValidate className='space-y-6' onSubmit={form.handleSubmit(handleSubmit)} method='POST'>
                {/* Avatar section */}
                <FormField
                    control={form.control}
                    name='avatar_file_id'
                    render={() => (
                        <FormItem>
                            <div className='flex flex-col items-center gap-3'>
                                <Avatar className='size-24 border-2 border-brand/20'>
                                    <AvatarImage src={avatarPreview} className='object-cover' />
                                    <AvatarFallback className='text-xl'>
                                        {user.name.split(' ').at(-1)?.[0]?.toUpperCase() ||
                                            t('updateProfile.avatarFallback')}
                                    </AvatarFallback>
                                </Avatar>

                                <input
                                    type='file'
                                    accept={getAcceptedFileAttribute('image')}
                                    className='hidden'
                                    ref={avatarPreviewRef}
                                    onChange={handleChangeAvatar}
                                />

                                <div className='flex flex-col items-center gap-1'>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        className='gap-1.5'
                                        onClick={() => avatarPreviewRef.current?.click()}
                                    >
                                        <Camera className='h-3.5 w-3.5' />
                                        {t('updateProfile.upload')}
                                    </Button>
                                    <p className='text-xs text-muted-foreground'>{t('updateProfile.avatarHint')}</p>
                                </div>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Fields */}
                <div className='space-y-4'>
                    <FormField
                        control={form.control}
                        name='name'
                        render={({ field }) => (
                            <FormItem>
                                <div className='space-y-1.5'>
                                    <Label htmlFor='name' className='text-sm font-medium'>
                                        {t('updateProfile.fullNameLabel')}
                                    </Label>
                                    <Input id='name' type='text' {...field} />
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='username'
                        render={({ field }) => (
                            <FormItem>
                                <div className='space-y-1.5'>
                                    <Label htmlFor='username' className='text-sm font-medium'>
                                        {t('updateProfile.usernameLabel')}
                                    </Label>
                                    <div className='relative'>
                                        <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm'>
                                            @
                                        </span>
                                        <Input id='username' type='text' className='pl-7' {...field} />
                                    </div>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='bio'
                        render={({ field }) => (
                            <FormItem>
                                <div className='space-y-1.5'>
                                    <Label htmlFor='bio' className='text-sm font-medium'>
                                        {t('updateProfile.bioLabel')}
                                    </Label>
                                    <Textarea
                                        id='bio'
                                        rows={3}
                                        className='resize-none'
                                        placeholder={t('updateProfile.bioPlaceholder')}
                                        {...field}
                                    />
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Save button */}
                <Button size='lg' type='submit' variant='brand' isLoading={isLoading} className='w-full rounded-full'>
                    {t('updateProfile.save')}
                </Button>
            </form>
        </Form>
    )
}
