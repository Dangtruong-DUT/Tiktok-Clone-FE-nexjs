export const locales = ['en', 'vi'] as const
export type LocalesType = (typeof locales)[number]

export const defaultLocale: LocalesType = 'en'

export const LANGUAGES = [
    { value: 'en', labelKey: 'en' },
    { value: 'vi', labelKey: 'vi' }
]

export const I18N_HEADER = 'NEXT-I18NEXT_LOCALE'
