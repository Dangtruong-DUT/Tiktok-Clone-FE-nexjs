function normalizePath(path: string) {
    if (path.length > 1 && path.endsWith('/')) {
        return path.slice(0, -1)
    }
    return path
}

export function isPathMatched(pathPrefixes: string[], pathname: string): boolean {
    const normalizedPathname = normalizePath(pathname)
    return pathPrefixes.some((pathPrefix) => {
        const normalizedPathPrefix = normalizePath(pathPrefix)
        return normalizedPathname === normalizedPathPrefix || normalizedPathname.startsWith(`${normalizedPathPrefix}/`)
    })
}
