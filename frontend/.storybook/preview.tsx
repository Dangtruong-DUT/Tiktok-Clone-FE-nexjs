import type { Preview } from '@storybook/nextjs-vite'
import '../src/app/[locale]/globals.css'
import { NextIntlClientProvider } from 'next-intl'
import common from '../messages/en/common.json'
import auth from '../messages/en/auth.json'
import home from '../messages/en/home.json'
import profile from '../messages/en/profile.json'
import admin from '../messages/en/admin.json'
import studio from '../messages/en/studio.json'
import appeal from '../messages/en/appeal.json'
import legal from '../messages/en/legal.json'

const defaultMessages = Object.assign({}, common, auth, home, profile, admin, studio, appeal, legal)

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i
            }
        },
        nextjs: {
            appDirectory: true,
            router: { pathname: '/', asPath: '/', query: {} }
        }
    },
    decorators: [
        (Story) => (
            <NextIntlClientProvider locale='en' messages={defaultMessages}>
                <Story />
            </NextIntlClientProvider>
        )
    ]
}

export default preview
