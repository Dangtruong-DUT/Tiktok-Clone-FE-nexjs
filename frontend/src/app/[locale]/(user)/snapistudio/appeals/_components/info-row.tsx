export function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className='flex items-start justify-between gap-4'>
            <span className='text-xs text-muted-foreground shrink-0'>{label}</span>
            <span className='text-xs font-medium text-right'>{value}</span>
        </div>
    )
}
