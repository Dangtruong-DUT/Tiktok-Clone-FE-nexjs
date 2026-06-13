import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ErrorScreenProps {
    type: 'missing' | 'fetch'
    errorMessage?: string
}

export function ErrorScreen({ type, errorMessage }: ErrorScreenProps) {
    const t = useTranslations('AppealPage')

    const title = type === 'missing' ? t('error.missingTitle') : t('error.invalidTitle')
    const description = type === 'missing' ? t('error.missingDescription') : errorMessage || t('error.invalidGeneric')

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className='w-full rounded-3xl border border-slate-200/80 bg-white p-8 shadow-lg shadow-slate-200/60 md:p-10'
        >
            <div className='flex flex-col items-center text-center gap-5 py-4'>
                <div className='rounded-2xl bg-red-50 p-4 ring-8 ring-red-50/50'>
                    <AlertTriangle className='h-8 w-8 text-red-500' />
                </div>
                <div className='space-y-1.5'>
                    <h1 className='text-2xl font-bold text-slate-900 tracking-tight'>{title}</h1>
                    <p className='text-slate-500 max-w-md text-sm leading-relaxed'>{description}</p>
                </div>
            </div>
        </motion.div>
    )
}
