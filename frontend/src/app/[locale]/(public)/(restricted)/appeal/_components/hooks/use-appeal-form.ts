import { useState } from 'react'

export function useAppealForm() {
    const [reason, setReason] = useState('')
    const [evidenceFiles, setEvidenceFiles] = useState<File[]>([])

    const charCount = reason.trim().length
    const charProgress = Math.min(charCount / 1000, 1)
    const canSubmit = charCount >= 20

    return {
        reason,
        setReason,
        evidenceFiles,
        setEvidenceFiles,
        charCount,
        charProgress,
        canSubmit
    }
}
