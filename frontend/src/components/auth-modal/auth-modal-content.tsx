'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AuthNav } from './components/auth-nav'
import { LegalNotice } from './components/legal-notice'
import { AuthMenuItem } from './components/auth-menu-item'
import { EmailFormView } from './components/email-form-view'
import { useAuthMenuItems } from './hooks/use-auth-menu-items'
import { AuthMode, AuthModeType, EMAIL_AUTH_MODES, LOGIN_MODES } from '@/constants/ui/auth-modal'

export function AuthModalContent() {
    const [mode, setMode] = useState<AuthModeType>(AuthMode.LOGIN)
    const tLogin = useTranslations('LoginPage')
    const tSignUp = useTranslations('SignUpPage')

    const menuItems = useAuthMenuItems(mode, setMode)
    const isEmailMode = (EMAIL_AUTH_MODES as readonly AuthModeType[]).includes(mode)
    const isLoginMode = (LOGIN_MODES as readonly AuthModeType[]).includes(mode)

    const handleModeChange = (newMode: typeof AuthMode.LOGIN | typeof AuthMode.SIGNUP) => {
        setMode(newMode)
    }

    const handleBackToMenu = () => {
        setMode(mode === AuthMode.LOGIN_EMAIL ? AuthMode.LOGIN : AuthMode.SIGNUP)
    }

    if (isEmailMode) {
        return (
            <div className='flex flex-col h-[90vh]'>
                <main className='flex-1 overflow-auto p-6  '>
                    <EmailFormView mode={mode} onBack={handleBackToMenu} />
                </main>
                <LegalNotice />
                <AuthNav isLoginMode={isLoginMode} onModeChange={handleModeChange} />
            </div>
        )
    }

    return (
        <div className='flex flex-col h-[90vh]'>
            <main className='flex-1 overflow-auto p-6'>
                <h1 className='text-2xl font-bold text-center mb-4 mt-16'>
                    {isLoginMode ? tLogin('title') : tSignUp('title')}
                </h1>
                <div className='grid gap-2 px-4'>
                    {menuItems.map((item) => (
                        <AuthMenuItem key={item.id} item={item} />
                    ))}
                </div>
            </main>
            <LegalNotice />
            <AuthNav isLoginMode={isLoginMode} onModeChange={handleModeChange} />
        </div>
    )
}
