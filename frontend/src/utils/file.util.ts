import { logger } from '@/utils/logger'

export async function convertBase64ToFileToFile(image: string, filename: string) {
    try {
        const res = await fetch(image)
        const blob = await res.blob()
        const file = new File([blob], filename, { type: 'image/png' })
        return file
    } catch (error) {
        logger.error('Error fetching thumbnail:', error)
    }
}
