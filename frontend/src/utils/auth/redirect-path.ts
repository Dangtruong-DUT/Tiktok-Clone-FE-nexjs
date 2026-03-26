export function getSafeInternalRedirectPath(redirectPath: string | null): string | null {
    if (!redirectPath || !redirectPath.startsWith('/')) {
        return null
    }
    if (redirectPath.startsWith('//')) {
        return null
    }
    return redirectPath
}
