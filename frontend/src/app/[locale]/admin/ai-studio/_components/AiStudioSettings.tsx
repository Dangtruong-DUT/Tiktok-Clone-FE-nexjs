'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useGetAiSettingsQuery, useUpdateAiSettingsMutation } from '@/store/services/admin/admin-ai-studio.service'
import {
    UpdateAiStudioSettingsReqBody,
    UpdateAiStudioSettingsReqBodyType
} from '@/types/dtos/ai/ai-content-suggestion.dto'
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
            toast.success('AI Studio settings saved.')
        } catch {
            toast.error('Failed to save settings.')
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
                                            AI Studio is {field.value ? 'ENABLED' : 'DISABLED'}
                                        </p>
                                        <p className='text-xs text-muted-foreground mt-0.5'>
                                            {field.value
                                                ? 'Users can generate AI content suggestions.'
                                                : 'All AI generation requests will be blocked.'}
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
                        Rate limits
                    </p>
                    <Controller
                        control={control}
                        name='daily_limit_per_user'
                        render={({ field }) => (
                            <SettingRow
                                label='Daily limit per user'
                                description='Max AI requests a single user can make per day'
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
                                label='Global daily limit'
                                description='Max total AI requests across all users per day'
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
                                label='Rate limit per minute'
                                description='Throttle per user (API middleware level)'
                            >
                                <NumberInput value={field.value ?? 10} onChange={field.onChange} min={1} max={60} />
                            </SettingRow>
                        )}
                    />
                </div>

                <div className='px-4'>
                    <p className='py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
                        Gemini model
                    </p>
                    <Controller
                        control={control}
                        name='gemini_model'
                        render={({ field }) => (
                            <SettingRow label='Model' description='Gemini model used for generation'>
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
                            <SettingRow label='Max output tokens' description='Max tokens in AI response'>
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
                                label='Temperature'
                                description='Creativity level (0.0 = deterministic, 1.0 = creative)'
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
                            <SettingRow label='Timeout (seconds)' description='Max time to wait for Gemini response'>
                                <NumberInput value={field.value ?? 30} onChange={field.onChange} min={10} max={120} />
                            </SettingRow>
                        )}
                    />
                </div>

                <div className='px-4'>
                    <p className='py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
                        Cache & async
                    </p>
                    <Controller
                        control={control}
                        name='cache_ttl_hours'
                        render={({ field }) => (
                            <SettingRow label='Cache TTL (hours)' description='How long identical requests are cached'>
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
                                label='Async mode'
                                description='Process via queue (recommended) instead of blocking HTTP'
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
                                label='Require minimum input'
                                description='Block requests with no title/description/transcript/OCR'
                            >
                                <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />
                            </SettingRow>
                        )}
                    />
                </div>

                <div className='p-4 flex justify-end'>
                    {data?.data.updated_by && (
                        <p className='text-xs text-muted-foreground mr-auto self-center'>
                            Last updated by {data.data.updated_by.name}
                        </p>
                    )}
                    <Button type='submit' size='sm' disabled={isSaving} className='gap-2'>
                        <Save size={14} />
                        {isSaving ? 'Saving...' : 'Save settings'}
                    </Button>
                </div>
            </Card>
        </form>
    )
}
