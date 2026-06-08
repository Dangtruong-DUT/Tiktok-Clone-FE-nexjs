import { useTranslations } from 'next-intl'
import { ModalLoginForm } from '../modal-login-form'
import { ModalSignUpForm } from '../modal-signup-form'
import { ChevronLeft } from 'lucide-react'
import { AuthMode, AuthModeType } from '@/constants/ui/auth-modal'

export interface EmailFormViewProps {
    mode: AuthModeType
    onBack: () => void
}

export function EmailFormView({ mode, onBack }: EmailFormViewProps) {
    const tLogin = useTranslations('LoginPage')
    const tSignUp = useTranslations('SignUpPage')

    if (mode === AuthMode.LOGIN_EMAIL) {
        return (
            <div>
                <button onClick={onBack} className='mb-4 text-sm text-muted-foreground cursor-pointer '>
                    <ChevronLeft className='size-8' />
                </button>
                <h1 className='text-2xl font-bold text-center mb-4'>{tLogin('title')}</h1>
                <div className='px-4'>
                    <ModalLoginForm />
                </div>
            </div>
        )
    }

    if (mode === AuthMode.SIGNUP_EMAIL) {
        return (
            <div>
                <button onClick={onBack} className='mb-4 text-sm text-muted-foreground  cursor-pointer'>
                    <ChevronLeft className='size-8' />
                </button>
                <h1 className='text-2xl font-bold text-center mb-4'>{tSignUp('title')}</h1>

                <div className='px-4'>
                    <ModalSignUpForm />
                </div>
            </div>
        )
    }

    return null
}
