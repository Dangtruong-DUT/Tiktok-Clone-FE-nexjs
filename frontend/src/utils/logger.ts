import { isProduction } from '@/config/app.config'

const noop = () => {}

export const logger = {
    log: isProduction ? noop : console.log.bind(console),
    warn: isProduction ? noop : console.warn.bind(console),
    error: isProduction ? noop : console.error.bind(console)
}
