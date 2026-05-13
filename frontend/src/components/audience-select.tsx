'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Audience } from '@/constants/enum'
import { AUDIENCE_VALUES } from '@/constants/enum'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface AudienceSelectProps {
    value: string
    onValueChange: (value: string) => void
    className?: string
    placeholder?: string
    includeAllOption?: boolean
    allOptionValue?: string
    allOptionLabel?: string
    disabled?: boolean
}

export default function AudienceSelect({
    value,
    onValueChange,
    className,
    placeholder,
    includeAllOption = false,
    allOptionValue = 'all',
    allOptionLabel,
    disabled
}: AudienceSelectProps) {
    const t = useTranslations('SnapiStudio.common.audience')

    const getAudienceLabel = (audience: Audience) => {
        switch (audience) {
            case Audience.PUBLIC:
                return t('public')
            case Audience.FRIENDS:
                return t('friends')
            case Audience.PRIVATE:
                return t('private')
            default:
                return t('unknown')
        }
    }

    return (
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
            <SelectTrigger className={cn('w-full', className)}>
                <SelectValue placeholder={placeholder ?? t('selectPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
                {includeAllOption && <SelectItem value={allOptionValue}>{allOptionLabel ?? t('all')}</SelectItem>}
                {AUDIENCE_VALUES.map((audience) => (
                    <SelectItem key={audience} value={audience.toString()}>
                        {getAudienceLabel(audience)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
