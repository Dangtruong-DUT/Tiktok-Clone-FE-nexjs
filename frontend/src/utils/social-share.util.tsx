import EmailCircleIcon from '@/components/icons/email-circle-icon'
import FacebookCircleIcon from '@/components/icons/facebook-circle-icon'
import LinkCircleIcon from '@/components/icons/link-circle-icon'
import LinkedinCircleIcon from '@/components/icons/linkedin-circle-icon'
import TelegramCircleIcon from '@/components/icons/telegram-circle-icon'
import WhatsAppCircleIcon from '@/components/icons/whats-app-circle-icon'
import XCircleIcon from '@/components/icons/x-circle-icon'

export const createShareItems = (url: string, handleCopyLink: () => void) => {
    return [
        {
            name: 'Copy',
            icon: <LinkCircleIcon />,
            onClick: handleCopyLink
        },
        {
            name: 'WhatsApp',
            icon: <WhatsAppCircleIcon />,
            onClick: () => window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, '_blank')
        },
        {
            name: 'Facebook',
            icon: <FacebookCircleIcon />,
            onClick: () =>
                window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(
                        'Check this out'
                    )}`,
                    '_blank'
                )
        },
        {
            name: 'X',
            icon: <XCircleIcon />,
            onClick: () =>
                window.open(
                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(
                        'Check this out'
                    )}`,
                    '_blank'
                )
        },
        {
            name: 'Telegram',
            icon: <TelegramCircleIcon />,
            onClick: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}`, '_blank')
        },
        {
            name: 'Email',
            icon: <EmailCircleIcon />,
            onClick: () =>
                window.open(
                    `mailto:?subject=${encodeURIComponent('Check this out')}&body=${encodeURIComponent(url)}`,
                    '_blank'
                )
        },
        {
            name: 'LinkedIn',
            icon: <LinkedinCircleIcon />,
            onClick: () =>
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
        }
    ]
}
