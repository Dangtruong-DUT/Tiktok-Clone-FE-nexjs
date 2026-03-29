import Footer from '@/app/[locale]/(user)/snapistudio/_components/footer'
import ChangePasswordForm from '@/app/[locale]/(user)/snapistudio/settings/change-password-form'
import PrivacySettingsForm from '@/app/[locale]/(user)/snapistudio/settings/privacy-settings-form'
import UpdateProfileForm from '@/app/[locale]/(user)/snapistudio/settings/update-profile-form'
import VerifyEmailForm from '@/app/[locale]/(user)/snapistudio/settings/verify-email-form'
import { Card, CardContent } from '@/components/ui/card'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('SnapiStudio.settings')

    return {
        title: t('page.title'),
        keywords: 'manage, settings'
    }
}

export default async function Setting() {
    const t = await getTranslations('SnapiStudio.settings')

    return (
        <div>
            <div className='flex-1 mx-auto max-w-6xl w-full p-4 sm:px-6 space-y-6'>
                <div className='space-y-2'>
                    <h1 className='text-3xl font-bold tracking-tight'>{t('page.title')}</h1>
                    <p className='text-muted-foreground'>{t('page.description')}</p>
                </div>

                <div className='grid gap-6 lg:grid-cols-2'>
                    <Card className='overflow-hidden'>
                        <CardContent className='p-6'>
                            <UpdateProfileForm />
                        </CardContent>
                    </Card>

                    <Card className='overflow-hidden'>
                        <CardContent className='p-6'>
                            <VerifyEmailForm />
                        </CardContent>
                    </Card>

                    <Card className='overflow-hidden'>
                        <CardContent className='p-6'>
                            <PrivacySettingsForm />
                        </CardContent>
                    </Card>

                    <Card className='overflow-hidden'>
                        <CardContent className='p-6'>
                            <ChangePasswordForm />
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Footer />
        </div>
    )
}
