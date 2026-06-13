'use client'

import { useMemo } from 'react'
import { useAppContext } from '@/provider/app-provider'
import { useGetAppealQuery, useGetResourcePreviewQuery } from '@/store/services/user/appeal.service'
import { APPEAL_PAGE_STATES, type AppealPageState } from './constants/appeal-page.constants'

import { useAppealPageState, useExistingPendingAppeal } from './hooks/use-appeal-page-state'
import { useAppealForm } from './hooks/use-appeal-form'
import { useAppealSubmit } from './hooks/use-appeal-submit'

import { LoadingScreen } from './screens/loading-screen'
import { AuthRequiredScreen } from './screens/auth-required-screen'
import { ErrorScreen } from './screens/error-screen'
import { PendingAppealScreen } from './screens/pending-appeal-screen'
import { SuccessScreen } from './screens/success-screen'
import { AppealForm } from './appeal-form/appeal-form'
import { ExistingAppealCard } from './appeal-form/existing-appeal-card'

interface AppealFormClientProps {
    appealUuid?: string
    appealType?: string
    resourceType?: string
    resourceUuid?: string
}

export function AppealFormClient(props: AppealFormClientProps) {
    const { hasSession } = useAppContext()
    // Need to safely check session since hook uses Redux too, but Redux is already used in hook.
    // For orchestrator, let's just pass a simplified isAuthenticated or use hook directly.
    const isEditFlow = !!props.appealUuid
    const isNewFlow = !props.appealUuid && !!props.appealType

    const pageState = useAppealPageState(props)
    const form = useAppealForm()

    // Check if auth state from context is needed, for existing pending appeal
    // Actually we can pass pageState to know if we are authenticated. But the hook needs it.
    // Let's just use `pageState !== APPEAL_PAGE_STATES.AUTH_REQUIRED` as a proxy for isAuthenticated.
    const isAuthenticated = pageState !== APPEAL_PAGE_STATES.AUTH_REQUIRED && pageState !== APPEAL_PAGE_STATES.LOADING

    const existingAppeal = useExistingPendingAppeal({ ...props, isAuthenticated })
    const submit = useAppealSubmit({ ...props, isEditFlow, isNewFlow })

    const { data: appealData } = useGetAppealQuery({ uuid: props.appealUuid ?? '' }, { skip: !props.appealUuid })
    const existingAppealInfo = appealData?.data

    const { data: resourcePreviewData, isLoading: isLoadingPreview } = useGetResourcePreviewQuery(
        { resourceType: props.resourceType ?? '', resourceUuid: props.resourceUuid },
        { skip: !isNewFlow || !props.resourceType }
    )
    const newFlowPreview = resourcePreviewData?.data ?? null

    const appealInfo = useMemo(() => {
        if (isNewFlow) {
            return {
                appeal_type: props.appealType,
                resource_type: props.resourceType,
                status: 'pending'
            }
        }
        if (isEditFlow && existingAppealInfo) {
            return {
                appeal_type: existingAppealInfo.appeal_type,
                resource_type: existingAppealInfo.resource_type,
                status: existingAppealInfo.status
            }
        }
        return null
    }, [isNewFlow, props.appealType, props.resourceType, isEditFlow, existingAppealInfo])

    // Resolved page state (includes runtime flags)
    const resolvedState: AppealPageState = submit.pendingAppealUuid
        ? APPEAL_PAGE_STATES.PENDING
        : submit.isSubmitted
          ? APPEAL_PAGE_STATES.SUCCESS
          : existingAppeal
            ? APPEAL_PAGE_STATES.EXISTING
            : pageState

    switch (resolvedState) {
        case APPEAL_PAGE_STATES.LOADING:
            return <LoadingScreen />
        case APPEAL_PAGE_STATES.AUTH_REQUIRED:
            return <AuthRequiredScreen {...props} isNewFlow={isNewFlow} isEditFlow={isEditFlow} />
        case APPEAL_PAGE_STATES.INVALID:
            return <ErrorScreen type='missing' />
        case APPEAL_PAGE_STATES.FETCH_ERROR:
            return <ErrorScreen type='fetch' />
        case APPEAL_PAGE_STATES.PENDING:
            return <PendingAppealScreen uuid={submit.pendingAppealUuid!} />
        case APPEAL_PAGE_STATES.EXISTING:
            return <ExistingAppealCard appeal={existingAppeal!} />
        case APPEAL_PAGE_STATES.SUCCESS:
            return <SuccessScreen uuid={submit.createdAppealUuid ?? props.appealUuid ?? null} />
        case APPEAL_PAGE_STATES.FORM:
            return (
                <AppealForm
                    form={form}
                    onSubmit={() => submit.submit(form.reason, form.evidenceFiles)}
                    isSubmitting={submit.isSubmitting}
                    appealInfo={appealInfo}
                    isEditFlow={isEditFlow}
                    isNewFlow={isNewFlow}
                    isLoadingPreview={isLoadingPreview}
                    newFlowPreview={newFlowPreview}
                    existingPreview={existingAppealInfo?.resource_preview}
                />
            )
        default:
            return null
    }
}
