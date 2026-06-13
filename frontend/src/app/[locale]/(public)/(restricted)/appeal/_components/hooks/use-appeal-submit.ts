import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useCreateAppealMutation, useUpdateAppealMutation } from '@/store/services/user/appeal.service'

interface SubmitProps {
    isEditFlow: boolean
    isNewFlow: boolean
    appealUuid?: string
    appealType?: string
    resourceType?: string
    resourceUuid?: string
}

export function useAppealSubmit(props: SubmitProps) {
    const t = useTranslations('AppealPage')
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [pendingAppealUuid, setPendingAppealUuid] = useState<string | null>(null)
    const [createdAppealUuid, setCreatedAppealUuid] = useState<string | null>(null)

    const [createAppeal, { isLoading: isCreating }] = useCreateAppealMutation()
    const [updateAppeal, { isLoading: isUpdating }] = useUpdateAppealMutation()

    const submit = useCallback(async (reason: string, evidenceFiles: File[]) => {
        const formData = new FormData()
        formData.append('reason', reason.trim())

        if (props.isNewFlow) {
            formData.append('appeal_type', props.appealType || '')
            formData.append('resource_type', props.resourceType || '')
            if (props.resourceUuid) {
                formData.append('resource_uuid', props.resourceUuid)
            }
        } else if (props.isEditFlow && props.appealUuid) {
            formData.append('_method', 'PUT')
        }

        evidenceFiles.forEach((file) => {
            formData.append('evidence_files[]', file)
        })

        try {
            if (props.isEditFlow && props.appealUuid) {
                await updateAppeal({ uuid: props.appealUuid, data: formData }).unwrap()
            } else {
                const result = await createAppeal(formData).unwrap()
                setCreatedAppealUuid(result.data.uuid ?? null)
            }
            setIsSubmitted(true)
        } catch (error) {
            const errData = (error as { data?: { message?: string; errors?: Record<string, unknown> } })?.data
            const existingUuid = errData?.errors?.existing_appeal_uuid
            if (typeof existingUuid === 'string') {
                setPendingAppealUuid(existingUuid)
                return
            }
            toast.error(errData?.message || t('form.submitError'))
        }
    }, [props, createAppeal, updateAppeal, t])

    return {
        submit,
        isSubmitting: isCreating || isUpdating,
        isSubmitted,
        pendingAppealUuid,
        createdAppealUuid
    }
}
