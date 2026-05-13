import { UPLOAD_CONSTRAINTS, UploadConstraintType } from '@/constants/ui/upload'

type UploadValidationErrorCode = 'invalid_type' | 'too_large'

export type UploadValidationResult =
    | {
          isValid: true
      }
    | {
          isValid: false
          code: UploadValidationErrorCode
          maxSizeMb: number
          acceptedExtensions: string
      }

export const getAcceptedFileAttribute = (type: UploadConstraintType) => {
    const config = UPLOAD_CONSTRAINTS[type]
    return config.mimes.map((item) => `.${item}`).join(',')
}

export const validateUploadFile = (file: File, type: UploadConstraintType): UploadValidationResult => {
    const config = UPLOAD_CONSTRAINTS[type]
    const maxSizeBytes = config.maxSizeKb * 1024
    const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
    const acceptedExtensions = config.mimes.map((item) => item.toUpperCase()).join(', ')
    const mimeTypeList = Array.from(config.mimeTypes) as string[]
    const extensionList = Array.from(config.mimes) as string[]

    const hasValidMimeType = mimeTypeList.includes(file.type)
    const hasValidExtension = extensionList.includes(extension)

    if (!hasValidMimeType && !hasValidExtension) {
        return {
            isValid: false,
            code: 'invalid_type',
            maxSizeMb: Math.floor(config.maxSizeKb / 1024),
            acceptedExtensions
        }
    }

    if (file.size > maxSizeBytes) {
        return {
            isValid: false,
            code: 'too_large',
            maxSizeMb: Math.floor(config.maxSizeKb / 1024),
            acceptedExtensions
        }
    }

    return {
        isValid: true
    }
}
