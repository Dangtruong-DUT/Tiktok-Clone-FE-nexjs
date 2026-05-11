import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'

const NAMESPACES = ['common', 'auth', 'home', 'profile', 'admin', 'studio', 'appeal', 'legal'] as const

export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale
    const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

    const parts = await Promise.all(
        NAMESPACES.map((ns) =>
            import(`../../messages/${locale}/${ns}.json`).then((m) => m.default)
        )
    )

    return { locale, messages: Object.assign({}, ...parts) }
})
