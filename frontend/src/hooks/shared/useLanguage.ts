import { LocalesType } from '@/i18n/config'
import { useRouter, usePathname } from '@/i18n/navigation'
import { useParams } from 'next/navigation'
import { useTransition } from 'react'

export default function useLanguage() {
    const pathname = usePathname()
    const params = useParams()
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const onChange = (value: string) => {
        const nextLocale = value as LocalesType

        startTransition(() => {
            router.replace(
                // @ts-expect-error -- TypeScript will validate that only known `params`
                { pathname, params },
                { locale: nextLocale }
            )
        })
    }
    return { onChange, isPending }
}
