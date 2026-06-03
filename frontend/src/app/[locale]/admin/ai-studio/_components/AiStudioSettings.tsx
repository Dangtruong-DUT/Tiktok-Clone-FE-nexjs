'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useGetAiSettingsQuery, useUpdateAiSettingsMutation } from '@/store/services/admin/admin-ai-studio.service'
import { z } from 'zod'

const GEMINI_MODELS = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'] as const

const UpdateAiStudioSettingsReqBody = z.object({
    daily_limit_per_user:  z.number().min(1).max(1000).optional(),
    global_daily_limit:    z.number().min(1).max(100000).optional(),
    rate_limit_per_minute: z.number().min(1).max(60).optional(),
    is_enabled:            z.boolean().optional(),
    require_min_input:     z.boolean().optional(),
    gemini_model:          z.enum(GEMINI_MODELS).optional(),
    max_output_tokens:     z.number().min(256).max(8192).optional(),
    temperature:           z.number().min(0).max(1).optional(),
    timeout_seconds:       z.number().min(10).max(120).optional(),
    cache_ttl_hours:       z.number().min(1).max(168).optional(),
    async_mode:            z.boolean().optional(),
})

type UpdateAiStudioSettingsReqBodyType = z.infer<typeof UpdateAiStudioSettingsReqBody>
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, Save } from 'lucide-react'

function SettingRow({
    label,
    description,
    children
}: {
    label: string
    description?: string
    children: React.ReactNode
}) {
    return (
        <div className='flex items-start justify-between gap-6 py-3'>
            <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium'>{label}</p>
                {description && <p className='text-xs text-muted-foreground mt-0.5'>{description}</p>}
            </div>
            <div className='shrink-0'>{children}</div>
        </div>
    )
}

function NumberInput({
    value,
    onChange,
    min,
    max
}: {
    value: number
    onChange: (v: number) => void
    min: number
    max: number
}) {
    return (
        <input
            type='number'
            value={value}
            min={min}
            max={max}
            onChange={(e) => onChange(Number(e.target.value))}
            className='w-24 h-8 rounded-md border border-input bg-background px-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-ring'
        />
    )
}

export function AiStudioSettings() {
    const t = useTranslations('AdminPage')
    const { data, isLoading } = useGetAiSettingsQuery()
    const [update, { isLoading: isSaving }] = useUpdateAiSettingsMutation()

    const { control, handleSubmit, reset } = useForm<UpdateAiStudioSettingsReqBodyType>({
        resolver: zodResolver(UpdateAiStudioSettingsReqBody)
    })

    useEffect(() => {
        if (data?.data) {
            reset({
                daily_limit_per_user: data.data.daily_limit_per_user,
                global_daily_limit: data.data.global_daily_limit,
                rate_limit_per_minute: data.data.rate_limit_per_minute,
                is_enabled: data.data.is_enabled,
                require_min_input: data.data.require_min_input,
                gemini_model: data.data.gemini_model as UpdateAiStudioSettingsReqBodyType['gemini_model'],
                max_output_tokens: data.data.max_output_tokens,
                temperature: data.data.temperature,
                timeout_seconds: data.data.timeout_seconds,
                cache_ttl_hours: data.data.cache_ttl_hours,
                async_mode: data.data.async_mode
            })
        }
    }, [data, reset])

    const onSubmit = async (values: UpdateAiStudioSettingsReqBodyType) => {
        try {
            await update(values).unwrap()
            toast.success(t('aiStudio.settings.toast.saved'))
        } catch {
            toast.error(t('aiStudio.settings.toast.error'))
        }
    }

    if (isLoading) {
        return (
            <Card className='p-6 space-y-4'>
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className='h-12' />
                ))}
            </Card>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card className='divide-y divide-border'>
                {/* Kill switch — most prominent */}
                <div className='p-4'>
                    <Controller
                        control={control}
                        name='is_enabled'
                        render={({ field }) => (
                            <div
                                className={`flex items-center justify-between rounded-xl p-4 border-2 ${field.value ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}
                            >
                                <div className='flex items-center gap-3'>
                                    {!field.value && <AlertTriangle size={18} className='text-red-500' />}
                                    <div>
                                        <p className='text-sm font-semibold'>
                                            {field.value
                                                ? t('aiStudio.settings.status.enabled')
                                                : t('aiStudio.settings.status.disabled')}
                                        </p>
                                        <p className='text-xs text-muted-foreground mt-0.5'>
                                            {field.value
                                                ? t('aiStudio.settings.status.enabledDescription')
                                                : t('aiStudio.settings.status.disabledDescription')}
                                        </p>
                                    </div>
                                </div>
                                <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />
                            </div>
                        )}
                    />
                </div>

                <div className='px-4'>
                    <p className='py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
                        {t('aiStudio.settings.sections.rateLimits')}
                    </p>
                    <Controller
                        control={control}
                        name='daily_limit_per_user'
                        render={({ field }) => (
                            <SettingRow
                                label={t('aiStudio.settings.fields.dailyLimitPerUser.label')}
                                description={t('aiStudio.settings.fields.dailyLimitPerUser.description')}
                            >
                                <NumberInput value={field.value ?? 20} onChange={field.onChange} min={1} max={1000} />
                            </SettingRow>
                        )}
                    />
                    <Separator />
                    <Controller
                        control={control}
                        name='global_daily_limit'
                        render={({ field }) => (
                            <SettingRow
                                label={t('aiStudio.settings.fields.globalDailyLimit.label')}
                                description={t('aiStudio.settings.fields.globalDailyLimit.description')}
                            >
                                <NumberInput
                                    value={field.value ?? 5000}
                                    onChange={field.onChange}
                                    min={1}
                                    max={100000}
                                />
                            </SettingRow>
                        )}
                    />
                    <Separator />
                    <Controller
                        control={control}
                        name='rate_limit_per_minute'
                        render={({ field }) => (
                            <SettingRow
                                label={t('aiStudio.settings.fields.rateLimitPerMinute.label')}
                                description={t('aiStudio.settings.fields.rateLimitPerMinute.description')}
                            >
                                <NumberInput value={field.value ?? 10} onChange={field.onChange} min={1} max={60} />
                            </SettingRow>
                        )}
                    />
                </div>

                <div className='px-4'>
                    <p className='py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
                        {t('aiStudio.settings.sections.geminiModel')}
                    </p>
                    <Controller
                        control={control}
                        name='gemini_model'
                        render={({ field }) => (
                            <SettingRow
                                label={t('aiStudio.settings.fields.model.label')}
                                description={t('aiStudio.settings.fields.model.description')}
                            >
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className='w-44 h-8 text-sm'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='gemini-1.5-flash'>gemini-1.5-flash</SelectItem>
                                        <SelectItem value='gemini-1.5-pro'>gemini-1.5-pro</SelectItem>
                                        <SelectItem value='gemini-2.0-flash'>gemini-2.0-flash</SelectItem>
                                    </SelectContent>
                                </Select>
                            </SettingRow>
                        )}
                    />
                    <Separator />
                    <Controller
                        control={control}
                        name='max_output_tokens'
                        render={({ field }) => (
                            <SettingRow
                                label={t('aiStudio.settings.fields.maxOutputTokens.label')}
                                description={t('aiStudio.settings.fields.maxOutputTokens.description')}
                            >
                                <NumberInput
                                    value={field.value ?? 2048}
                                    onChange={field.onChange}
                                    min={256}
                                    max={8192}
                                />
                            </SettingRow>
                        )}
                    />
                    <Separator />
                    <Controller
                        control={control}
                        name='temperature'
                        render={({ field }) => (
                            <SettingRow
                                label={t('aiStudio.settings.fields.temperature.label')}
                                description={t('aiStudio.settings.fields.temperature.description')}
                            >
                                <input
                                    type='number'
                                    step='0.05'
                                    min={0}
                                    max={1}
                                    value={field.value ?? 0.7}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    className='w-20 h-8 rounded-md border border-input bg-background px-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-ring'
                                />
                            </SettingRow>
                        )}
                    />
                    <Separator />
                    <Controller
                        control={control}
                        name='timeout_seconds'
                        render={({ field }) => (
                            <SettingRow
                                label={t('aiStudio.settings.fields.timeoutSeconds.label')}
                                description={t('aiStudio.settings.fields.timeoutSeconds.description')}
                            >
                                <NumberInput value={field.value ?? 30} onChange={field.onChange} min={10} max={120} />
                            </SettingRow>
                        )}
                    />
                </div>

                <div className='px-4'>
                    <p className='py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
                        {t('aiStudio.settings.sections.cacheAsync')}
                    </p>
                    <Controller
                        control={control}
                        name='cache_ttl_hours'
                        render={({ field }) => (
                            <SettingRow
                                label={t('aiStudio.settings.fields.cacheTtlHours.label')}
                                description={t('aiStudio.settings.fields.cacheTtlHours.description')}
                            >
                                <NumberInput value={field.value ?? 6} onChange={field.onChange} min={1} max={168} />
                            </SettingRow>
                        )}
                    />
                    <Separator />
                    <Controller
                        control={control}
                        name='async_mode'
                        render={({ field }) => (
                            <SettingRow
                                label={t('aiStudio.settings.fields.asyncMode.label')}
                                description={t('aiStudio.settings.fields.asyncMode.description')}
                            >
                                <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />
                            </SettingRow>
                        )}
                    />
                    <Separator />
                    <Controller
                        control={control}
                        name='require_min_input'
                        render={({ field }) => (
                            <SettingRow
                                label={t('aiStudio.settings.fields.requireMinInput.label')}
                                description={t('aiStudio.settings.fields.requireMinInput.description')}
                            >
                                <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />
                            </SettingRow>
                        )}
                    />
                </div>

                <div className='p-4 flex justify-end'>
                    {data?.data.updated_by && (
                        <p className='text-xs text-muted-foreground mr-auto self-center'>
                            {t('aiStudio.settings.lastUpdatedBy', { name: data.data.updated_by.name })}
                        </p>
                    )}
                    <Button type='submit' size='sm' disabled={isSaving} className='gap-2'>
                        <Save size={14} />
                        {isSaving
                            ? t('aiStudio.settings.buttons.saving')
                            : t('aiStudio.settings.buttons.save')}
                    </Button>
                </div>
            </Card>
        </form>
    )
}
