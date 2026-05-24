import { createElement } from 'react'
import { UserRound } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import { getOauthGoogleUrl } from '@/utils/auth/oauth.util'
import { AuthMenuItemProps } from '../components/auth-menu-item'
import { AuthMode, AuthModeType } from '@/constants/ui/auth-modal'

export function useAuthMenuItems(mode: AuthModeType, setMode: (mode: AuthModeType) => void) {
    const oauthGoogleUrl = getOauthGoogleUrl()

    const menuItems: AuthMenuItemProps[] = [
        {
            id: 'email',
            title: 'Use email',
            icon: createElement(UserRound, { height: '5rem' }),
            action: () => setMode(mode === AuthMode.LOGIN ? AuthMode.LOGIN_EMAIL : AuthMode.SIGNUP_EMAIL),
            for: [AuthMode.LOGIN, AuthMode.SIGNUP] as const
        },
        {
            id: 'google',
            title: 'Continue with Google',
            icon: createElement(FcGoogle, { height: '5rem' }),
            href: oauthGoogleUrl,
            for: [AuthMode.LOGIN, AuthMode.SIGNUP] as const
        }
    ]

    const isLoginFlow = mode.includes('login')
    const currentFor = isLoginFlow ? AuthMode.LOGIN : AuthMode.SIGNUP
    return menuItems.filter((item) => item.for.includes(currentFor))
}
