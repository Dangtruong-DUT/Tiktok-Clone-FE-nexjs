import { locales } from '@/i18n/config'

function buildLocalizedRoutes(basePaths: string[]) {
    return locales.flatMap((locale) => basePaths.map((basePath) => `/${locale}${basePath}`))
}

const SUPER_ADMIN_BASE_PATHS = ['/admin']
const BANNED_BASE_PATHS = ['/banned']
const USER_PROTECTED_BASE_PATHS = ['/business-suite', '/snapistudio', '/appeal', ...BANNED_BASE_PATHS]
const GUEST_ONLY_BASE_PATHS = ['/login', '/register', '/oauth']
const PUBLIC_BASE_PATHS = ['/privacy-policy', '/terms-of-service']

export const BANNED_ROUTE_PREFIXES = buildLocalizedRoutes(BANNED_BASE_PATHS)
export const PUBLIC_ROUTE_PREFIXES = buildLocalizedRoutes(PUBLIC_BASE_PATHS)
export const SUPER_ADMIN_ROUTE_PREFIXES = buildLocalizedRoutes(SUPER_ADMIN_BASE_PATHS)
export const USER_PROTECTED_ROUTE_PREFIXES = buildLocalizedRoutes(USER_PROTECTED_BASE_PATHS)
export const GUEST_ONLY_ROUTE_PREFIXES = buildLocalizedRoutes(GUEST_ONLY_BASE_PATHS)
export const PROTECTED_ROUTE_PREFIXES = [...SUPER_ADMIN_ROUTE_PREFIXES, ...USER_PROTECTED_ROUTE_PREFIXES]
