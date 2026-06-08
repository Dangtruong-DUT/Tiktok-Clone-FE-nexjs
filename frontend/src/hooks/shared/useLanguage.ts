import { LocalesType } from '@/i18n/config'
import { useRouter, usePathname } from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export default function useLanguage() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const onChange = (value: string) => {
        const nextLocale = value as LocalesType
        const search = searchParams?.toString()
        const href = search ? `${pathname}?${search}` : pathname

        startTransition(() => {
            router.replace(href as never, { locale: nextLocale })
        })
    }
    return { onChange, isPending }
}
