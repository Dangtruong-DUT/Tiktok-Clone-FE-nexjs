import { useAppContext } from '@/provider/app-provider'
import { useAppSelector } from '@/store/hooks'
import { AuthStatus } from '@/constants/status/async'
import { APPEAL_STATUSES } from '@/constants/appeal'
import type { AppealType } from '@/constants/appeal'
import { useGetAppealQuery, useGetMyAppealsQuery } from '@/store/services/user/appeal.service'
import { APPEAL_PAGE_STATES, type AppealPageState } from '../constants/appeal-page.constants'

interface UseAppealPageStateProps {
    appealUuid?: string
    appealType?: string
    resourceType?: string
    resourceUuid?: string
}

export function useAppealPageState(props: UseAppealPageStateProps): AppealPageState {
    const { authStatus, hasSession } = useAppContext()
    const storeAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)
    const isAuthenticated = hasSession || storeAuthenticated

    const isEditFlow = !!props.appealUuid
    const isNewFlow = !props.appealUuid && !!props.appealType

    const { isLoading: isFetchingAppeal, isError: isFetchError } =
        useGetAppealQuery({ uuid: props.appealUuid ?? '' }, { skip: !props.appealUuid })

    const shouldCheckPending = isNewFlow && isAuthenticated
    const { isLoading: isCheckingPending } = useGetMyAppealsQuery(
        { appeal_status: APPEAL_STATUSES.PENDING, appeal_type: props.appealType as AppealType, per_page: 20 },
        { skip: !shouldCheckPending }
    )

    if (authStatus === AuthStatus.LOADING || isCheckingPending || isFetchingAppeal) {
        return APPEAL_PAGE_STATES.LOADING
    }

    if (!isAuthenticated) return APPEAL_PAGE_STATES.AUTH_REQUIRED
    if (!isNewFlow && !isEditFlow) return APPEAL_PAGE_STATES.INVALID
    if (isFetchError) return APPEAL_PAGE_STATES.FETCH_ERROR

    return APPEAL_PAGE_STATES.FORM
}

export function useExistingPendingAppeal(props: UseAppealPageStateProps & { isAuthenticated: boolean }) {
    const isNewFlow = !props.appealUuid && !!props.appealType
    const shouldCheckPending = isNewFlow && props.isAuthenticated
    
    const { data: pendingAppealsData } = useGetMyAppealsQuery(
        { appeal_status: APPEAL_STATUSES.PENDING, appeal_type: props.appealType as AppealType, per_page: 20 },
        { skip: !shouldCheckPending }
    )

    if (!shouldCheckPending || !pendingAppealsData?.data?.length) return null
    const appeals = pendingAppealsData.data
    if (!props.resourceUuid) return appeals.find((a) => a.resource_type === props.resourceType) ?? null
    return appeals.find((a) => a.resource_preview?.uuid === props.resourceUuid) ?? null
}
