'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { PrivacyVisibility } from '@/constants/enum'
import { formatFetchBaseQueryErrorMessage } from '@/store/utils/formatFetchBaseQueryErrorMessage.util'
import { useGetUserSettingsQuery, useUpdateUserSettingsMutation } from '@/store/services/user/user.service'
import { UpdateUserSettingsBodyType } from '@/types/dtos/user/user-request.dto'
import { UserSettingsType } from '@/types/models/user-settings.model'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

type PrivacyFieldKey = keyof Pick<
    UserSettingsType,
    'liked_videos_visibility' | 'bookmarked_videos_visibility' | 'followers_visibility' | 'following_visibility'
>

type PrivacySettingItem = {
    key: PrivacyFieldKey
    label: string
    description: string
}

type PrivacyFormState = Pick<
    UserSettingsType,
    'liked_videos_visibility' | 'bookmarked_videos_visibility' | 'followers_visibility' | 'following_visibility'
>

function mapToPrivacyFormState(data: UserSettingsType): PrivacyFormState {
    return {
        liked_videos_visibility: data.liked_videos_visibility,
        bookmarked_videos_visibility: data.bookmarked_videos_visibility,
        followers_visibility: data.followers_visibility,
        following_visibility: data.following_visibility
    }
}

export default function PrivacySettingsForm() {
    const t = useTranslations('SnapiStudio.settings')
    const { data: settingsRes, isLoading, isFetching } = useGetUserSettingsQuery()
    const [updateSettingsMutate, { isLoading: isUpdating }] = useUpdateUserSettingsMutation()

    const [draftSettings, setDraftSettings] = useState<PrivacyFormState | null>(null)

    const privacyFields = useMemo<PrivacySettingItem[]>(
        () => [
            {
                key: 'liked_videos_visibility',
                label: t('privacy.fields.likedVideos.label'),
                description: t('privacy.fields.likedVideos.description')
            },
            {
                key: 'bookmarked_videos_visibility',
                label: t('privacy.fields.bookmarkedVideos.label'),
                description: t('privacy.fields.bookmarkedVideos.description')
            },
            {
                key: 'followers_visibility',
                label: t('privacy.fields.followers.label'),
                description: t('privacy.fields.followers.description')
            },
            {
                key: 'following_visibility',
                label: t('privacy.fields.following.label'),
                description: t('privacy.fields.following.description')
            }
        ],
        [t]
    )

    const initialSettings = useMemo(() => {
        if (!settingsRes?.data) return null
        return mapToPrivacyFormState(settingsRes.data)
    }, [settingsRes])

    useEffect(() => {
        if (!initialSettings) return
        setDraftSettings(initialSettings)
    }, [initialSettings])

    const currentSettings = draftSettings ?? initialSettings

    const hasChanges = useMemo(() => {
        if (!initialSettings || !currentSettings) return false

        return privacyFields.some((field) => initialSettings[field.key] !== currentSettings[field.key])
    }, [currentSettings, initialSettings, privacyFields])

    const handleToggle = useCallback((key: PrivacyFieldKey, checked: boolean) => {
        setDraftSettings((prev) => {
            const previous = prev ?? {
                liked_videos_visibility: PrivacyVisibility.PUBLIC,
                bookmarked_videos_visibility: PrivacyVisibility.PUBLIC,
                followers_visibility: PrivacyVisibility.PUBLIC,
                following_visibility: PrivacyVisibility.PUBLIC
            }

            return {
                ...previous,
                [key]: checked ? PrivacyVisibility.PRIVATE : PrivacyVisibility.PUBLIC
            }
        })
    }, [])

    const handleReset = useCallback(() => {
        if (!initialSettings) return
        setDraftSettings(initialSettings)
    }, [initialSettings])

    const handleSave = useCallback(async () => {
        if (!initialSettings || !currentSettings || !hasChanges || isUpdating) return

        const changedPayload = privacyFields.reduce<UpdateUserSettingsBodyType>((payload, field) => {
            if (initialSettings[field.key] !== currentSettings[field.key]) {
                payload[field.key] = currentSettings[field.key]
            }
            return payload
        }, {})

        if (Object.keys(changedPayload).length === 0) return

        try {
            const response = await updateSettingsMutate(changedPayload).unwrap()
            setDraftSettings(mapToPrivacyFormState(response.data))
            toast.success(response.message)
        } catch (error) {
            const parsedError = formatFetchBaseQueryErrorMessage(error as FetchBaseQueryError)
            toast.error(parsedError.description || t('privacy.updateError'))
        }
    }, [currentSettings, hasChanges, initialSettings, isUpdating, privacyFields, t, updateSettingsMutate])

    if (isLoading || (isFetching && !currentSettings) || !currentSettings) {
        return (
            <div className='space-y-6'>
                <div className='flex items-center gap-2 mb-6'>
                    <Skeleton className='size-9 rounded-full' />
                    <div className='space-y-2'>
                        <Skeleton className='h-4 w-24' />
                        <Skeleton className='h-3 w-56' />
                    </div>
                </div>

                <div className='rounded-lg border bg-muted/20 divide-y'>
                    {[1, 2, 3, 4].map((index) => (
                        <div key={index} className='flex items-center justify-between gap-4 p-4 sm:p-5'>
                            <div className='space-y-2'>
                                <Skeleton className='h-4 w-32' />
                                <Skeleton className='h-3 w-52' />
                            </div>
                            <Skeleton className='h-5 w-10 rounded-full' />
                        </div>
                    ))}
                </div>

                <div className='items-center gap-2 md:ml-auto flex'>
                    <Skeleton className='h-9 w-[90px]' />
                    <Skeleton className='h-9 w-[90px]' />
                </div>
            </div>
        )
    }

    return (
        <div className='space-y-6'>
            <div className='flex items-center gap-2 mb-6'>
                <div className='p-2 rounded-full bg-brand/10'>
                    <ShieldCheck className='w-5 h-5 text-brand' />
                </div>
                <div>
                    <h3 className='font-semibold'>{t('privacy.title')}</h3>
                    <p className='text-sm text-muted-foreground'>{t('privacy.description')}</p>
                </div>
            </div>

            <div className='rounded-lg border bg-muted/20 divide-y'>
                {privacyFields.map((field) => {
                    const isPrivate = currentSettings[field.key] === PrivacyVisibility.PRIVATE

                    return (
                        <div key={field.key} className='flex items-center justify-between gap-4 p-4 sm:p-5'>
                            <div className='space-y-1'>
                                <Label className='text-sm font-semibold text-foreground'>{field.label}</Label>
                                <p className='text-sm text-muted-foreground'>{field.description}</p>
                            </div>
                            <div className='flex items-center gap-3'>
                                <span className='min-w-[60px] text-right text-xs text-muted-foreground'>
                                    {isPrivate ? t('privacy.private') : t('privacy.public')}
                                </span>
                                <Switch
                                    checked={isPrivate}
                                    onCheckedChange={(checked) => {
                                        handleToggle(field.key, checked)
                                    }}
                                    disabled={isUpdating}
                                    aria-label={field.label}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className='items-center gap-2 md:ml-auto flex'>
                <Button
                    variant='outline'
                    size='lg'
                    type='button'
                    className='min-w-[100px]'
                    onClick={handleReset}
                    disabled={!hasChanges || isUpdating}
                >
                    {t('privacy.cancel')}
                </Button>
                <Button
                    size='lg'
                    type='button'
                    variant='brand'
                    isLoading={isUpdating}
                    disabled={!hasChanges || isUpdating}
                    className='min-w-[100px]'
                    onClick={handleSave}
                >
                    {t('privacy.save')}
                </Button>
            </div>
        </div>
    )
}
