import { locales } from '@/i18n/config'

function buildLocalizedRoutes(basePaths: string[]) {
    return locales.flatMap((locale) => basePaths.map((basePath) => `/${locale}${basePath}`))
}

const SUPER_ADMIN_BASE_PATHS = ['/admin']
const USER_PROTECTED_BASE_PATHS = ['/business-suite', '/snapistudio']
const GUEST_ONLY_BASE_PATHS = ['/login', '/register', '/oauth']

export const SUPER_ADMIN_ROUTE_PREFIXES = buildLocalizedRoutes(SUPER_ADMIN_BASE_PATHS)
export const USER_PROTECTED_ROUTE_PREFIXES = buildLocalizedRoutes(USER_PROTECTED_BASE_PATHS)
export const GUEST_ONLY_ROUTE_PREFIXES = buildLocalizedRoutes(GUEST_ONLY_BASE_PATHS)

export const PROTECTED_ROUTE_PREFIXES = [...SUPER_ADMIN_ROUTE_PREFIXES, ...USER_PROTECTED_ROUTE_PREFIXES]
