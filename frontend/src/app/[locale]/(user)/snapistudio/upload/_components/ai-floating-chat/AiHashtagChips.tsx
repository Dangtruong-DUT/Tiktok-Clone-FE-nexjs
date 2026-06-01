'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

interface AiHashtagChipsProps {
    hashtags: string[]
}

export function AiHashtagChips({ hashtags }: AiHashtagChipsProps) {
    const [copied, setCopied] = useState(false)

    if (!hashtags.length) return null

    const handleCopyAll = async () => {
        await navigator.clipboard.writeText(hashtags.join(' '))
        setCopied(true)
        toast.success('Hashtags copied!')
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className='space-y-2'>
            <div className='flex items-center justify-between'>
                <span className='text-xs font-medium text-muted-foreground'>Hashtags</span>
                <button
                    type='button'
                    onClick={handleCopyAll}
                    className='flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors'
                >
                    {copied ? <Check size={12} className='text-green-500' /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy all'}
                </button>
            </div>
            <div className='flex flex-wrap gap-1.5'>
                {hashtags.map((tag) => (
                    <Badge
                        key={tag}
                        variant='secondary'
                        className='text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors'
                        onClick={async () => {
                            await navigator.clipboard.writeText(tag)
                            toast.success(`${tag} copied!`)
                        }}
                    >
                        {tag}
                    </Badge>
                ))}
            </div>
        </div>
    )
}
