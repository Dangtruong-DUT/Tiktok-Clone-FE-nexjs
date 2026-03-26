const superAdminPaths = ['/vi/admin', '/en/admin']
const userPaths = ['/vi/business-suite', '/en/business-suite', '/vi/tiktokstudio', '/en/tiktokstudio']
const unauthenticatedPaths = ['/vi/login', '/en/login', '/vi/register', '/en/register', '/en/oauth', '/vi/oauth']

const protectedPaths = [...superAdminPaths, ...userPaths]

export function isPathIncluded(pathList: string[], pathname: string) {
    return pathList.some((path) => pathname.includes(path))
}

export { superAdminPaths, userPaths, unauthenticatedPaths, protectedPaths }
