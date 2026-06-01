'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Sparkles, RefreshCw } from 'lucide-react'
import { GenerateAiSuggestionReqBody, GenerateAiSuggestionReqBodyType } from '@/types/dtos/ai/ai-content-suggestion.dto'

const LANGUAGES = [
    { value: 'vi', label: '🇻🇳 Tiếng Việt' },
    { value: 'en', label: '🇺🇸 English' },
    { value: 'ja', label: '🇯🇵 Japanese' },
    { value: 'ko', label: '🇰🇷 Korean' },
    { value: 'zh', label: '🇨🇳 Chinese' },
    { value: 'other', label: '🌐 Other' }
]

interface AiInputPanelProps {
    initialTitle?: string
    initialDescription?: string
    isGenerating: boolean
    hasResult: boolean
    onGenerate: (data: GenerateAiSuggestionReqBodyType) => void
    onRegenerate: (data: GenerateAiSuggestionReqBodyType) => void
}

export function AiInputPanel({
    initialTitle,
    initialDescription,
    isGenerating,
    hasResult,
    onGenerate,
    onRegenerate
}: AiInputPanelProps) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm<GenerateAiSuggestionReqBodyType>({
        resolver: zodResolver(GenerateAiSuggestionReqBody),
        defaultValues: {
            video_title: initialTitle ?? '',
            video_description: initialDescription ?? '',
            creator_language: 'vi'
        }
    })

    const titleVal = watch('video_title') ?? ''
    const descVal = watch('video_description') ?? ''

    const handleFormSubmit = handleSubmit((data) => {
        if (hasResult) {
            onRegenerate(data)
        } else {
            onGenerate(data)
        }
    })

    return (
        <form onSubmit={handleFormSubmit} className='space-y-3 p-4 border-b border-border'>
            {/* Title */}
            <div className='space-y-1'>
                <label className='text-xs font-medium text-muted-foreground'>Video title</label>
                <Textarea
                    {...register('video_title')}
                    placeholder='Enter video title...'
                    className='resize-none text-sm min-h-[48px] bg-muted/40'
                    rows={2}
                />
            </div>

            {/* Description */}
            <div className='space-y-1'>
                <label className='text-xs font-medium text-muted-foreground'>Description / Transcript</label>
                <Textarea
                    {...register('video_description')}
                    placeholder='What is your video about?...'
                    className='resize-none text-sm min-h-[64px] bg-muted/40'
                    rows={3}
                />
            </div>

            {/* Language select */}
            <div className='space-y-1'>
                <label className='text-xs font-medium text-muted-foreground'>Output language</label>
                <Select
                    defaultValue='vi'
                    onValueChange={(v) =>
                        setValue('creator_language', v as GenerateAiSuggestionReqBodyType['creator_language'])
                    }
                >
                    <SelectTrigger className='h-8 text-sm'>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {LANGUAGES.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value} className='text-sm'>
                                {lang.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Validation error */}
            {errors.root && <p className='text-xs text-destructive'>{errors.root.message}</p>}

            {/* Submit */}
            <Button
                type='submit'
                size='sm'
                className='w-full gap-2'
                disabled={isGenerating || (!titleVal.trim() && !descVal.trim())}
            >
                {isGenerating ? (
                    <>
                        <Loader2 size={14} className='animate-spin' />
                        Generating...
                    </>
                ) : hasResult ? (
                    <>
                        <RefreshCw size={14} />
                        Regenerate
                    </>
                ) : (
                    <>
                        <Sparkles size={14} />
                        Generate with AI
                    </>
                )}
            </Button>
        </form>
    )
}
