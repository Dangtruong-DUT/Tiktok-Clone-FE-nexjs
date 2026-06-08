import { ADMIN_ROUTES, APP_ROUTES, AUTH_ROUTES, LEGAL_ROUTES, SNAPISTUDIO_ROUTES } from '@/constants/routes/routes'
import { locales } from '@/i18n/config'

function buildLocalizedRoutes(basePaths: string[]) {
    return locales.flatMap((locale) => basePaths.map((basePath) => `/${locale}${basePath}`))
}

const SUPER_ADMIN_BASE_PATHS = [ADMIN_ROUTES.DASHBOARD]
const BANNED_BASE_PATHS = [APP_ROUTES.BANNED]
const USER_PROTECTED_BASE_PATHS = [
    APP_ROUTES.BUSINESS_SUITE,
    SNAPISTUDIO_ROUTES.ROOT,
    APP_ROUTES.APPEAL,
    ...BANNED_BASE_PATHS
]
const GUEST_ONLY_BASE_PATHS = [AUTH_ROUTES.LOGIN, AUTH_ROUTES.SIGN_UP, AUTH_ROUTES.REGISTER, AUTH_ROUTES.OAUTH]
const PUBLIC_BASE_PATHS = [LEGAL_ROUTES.PRIVACY_POLICY, LEGAL_ROUTES.TERMS_OF_SERVICE]
// Routes that must skip the refreshTokenMiddleware to avoid redirect loops
const REFRESH_SKIP_BASE_PATHS = [...GUEST_ONLY_BASE_PATHS, AUTH_ROUTES.TOKEN_REFRESH]

export const BANNED_ROUTE_PREFIXES = buildLocalizedRoutes(BANNED_BASE_PATHS)
export const PUBLIC_ROUTE_PREFIXES = buildLocalizedRoutes(PUBLIC_BASE_PATHS)
export const SUPER_ADMIN_ROUTE_PREFIXES = buildLocalizedRoutes(SUPER_ADMIN_BASE_PATHS)
export const USER_PROTECTED_ROUTE_PREFIXES = buildLocalizedRoutes(USER_PROTECTED_BASE_PATHS)
export const GUEST_ONLY_ROUTE_PREFIXES = buildLocalizedRoutes(GUEST_ONLY_BASE_PATHS)
export const PROTECTED_ROUTE_PREFIXES = [...SUPER_ADMIN_ROUTE_PREFIXES, ...USER_PROTECTED_ROUTE_PREFIXES]
export const REFRESH_SKIP_ROUTE_PREFIXES = buildLocalizedRoutes(REFRESH_SKIP_BASE_PATHS)
