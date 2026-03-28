import envConfig from './app.config'

export const BRAND_CONFIG = {
    APP_NAME: envConfig.APP_NAME,
    COMPANY_NAME: envConfig.COMPANY_NAME,
    CONTACT_EMAIL: envConfig.CONTACT_EMAIL,
    JURISDICTION: envConfig.JURISDICTION
} as const
