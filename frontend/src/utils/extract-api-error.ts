export function extractApiError(error: unknown): string | undefined {
    return (error as { data?: { message?: string } })?.data?.message
}
