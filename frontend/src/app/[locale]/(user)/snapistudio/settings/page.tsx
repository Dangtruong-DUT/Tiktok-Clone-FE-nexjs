import Footer from '@/app/[locale]/(user)/snapistudio/_components/footer'
import ChangePasswordForm from '@/app/[locale]/(user)/snapistudio/settings/change-password-form'
import UpdateProfileForm from '@/app/[locale]/(user)/snapistudio/settings/update-profile-form'
import VerifyEmailForm from '@/app/[locale]/(user)/snapistudio/settings/verify-email-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
            <div className='flex-1 mx-auto max-w-4xl w-full p-4 sm:px-6'>
                <Card className='overflow-hidden'>
                    <CardHeader>
                        <CardTitle className='text-2xl'>{t('page.title')}</CardTitle>
                        <p className='text-muted-foreground'>{t('page.description')}</p>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                        <UpdateProfileForm />
                        <Separator className='my-6' />
                        <VerifyEmailForm />
                        <Separator className='my-6' />
                        <ChangePasswordForm />
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </div>
    )
}
