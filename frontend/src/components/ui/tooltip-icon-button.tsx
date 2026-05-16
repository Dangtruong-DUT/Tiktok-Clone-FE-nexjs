import { type ComponentProps, type ElementType } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type ButtonVariant = ComponentProps<typeof Button>['variant']

interface TooltipIconButtonProps {
    icon: ElementType
    tooltip: string
    onClick: () => void
    disabled?: boolean
    className?: string
    variant?: ButtonVariant
}

export function TooltipIconButton({
    icon: Icon,
    tooltip,
    onClick,
    disabled,
    className,
    variant = 'ghost'
}: TooltipIconButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant={variant}
                    size='icon'
                    className={`h-8 w-8 ${className ?? ''}`}
                    onClick={onClick}
                    disabled={disabled}
                >
                    <Icon className='h-4 w-4' />
                </Button>
            </TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
    )
}
