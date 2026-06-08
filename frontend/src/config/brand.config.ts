import envConfig from './app.config'

export const BRAND_CONFIG = {
    APP_NAME: envConfig.NEXT_PUBLIC_APP_NAME,
    COMPANY_NAME: envConfig.NEXT_PUBLIC_COMPANY_NAME,
    CONTACT_EMAIL: envConfig.NEXT_PUBLIC_CONTACT_EMAIL,
    JURISDICTION: envConfig.NEXT_PUBLIC_JURISDICTION
} as const
