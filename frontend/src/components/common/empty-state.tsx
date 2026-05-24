interface EmptyStateProps {
    message: string
    className?: string
}

export function EmptyState({ message, className }: EmptyStateProps) {
    return (
        <div className={`py-16 text-center ${className ?? ''}`}>
            <p className='text-sm text-muted-foreground'>{message}</p>
        </div>
    )
}
