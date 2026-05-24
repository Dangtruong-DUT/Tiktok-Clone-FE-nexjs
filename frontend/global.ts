import { routing } from '@/i18n/routing'
import common from './messages/en/common.json'
import auth from './messages/en/auth.json'
import home from './messages/en/home.json'
import profile from './messages/en/profile.json'
import admin from './messages/en/admin.json'
import studio from './messages/en/studio.json'
import appeal from './messages/en/appeal.json'
import legal from './messages/en/legal.json'
import error from './messages/en/error.json'

type Messages = typeof common &
    typeof auth &
    typeof home &
    typeof profile &
    typeof admin &
    typeof studio &
    typeof appeal &
    typeof legal &
    typeof error

declare module 'next-intl' {
    interface AppConfig {
        Locale: (typeof routing.locales)[number]
        Messages: Messages
    }
}
