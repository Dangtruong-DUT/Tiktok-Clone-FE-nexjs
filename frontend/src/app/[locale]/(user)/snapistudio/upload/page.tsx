import FormUploadVideo from '@/app/[locale]/(user)/snapistudio/upload/_components/form-upload-video'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('SnapiStudio.upload')

    return {
        title: t('page.title'),
        description: t('page.description')
    }
}

export default function UploadPage() {
    return (
        <div className='px-4 py-6 sm:px-6 lg:px-8'>
            <FormUploadVideo />
        </div>
    )
}
