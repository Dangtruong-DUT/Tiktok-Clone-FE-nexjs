import { routesValuesType } from '@/app/[locale]/(public)/(home)/_components/sidebar/_config/menu-items-sidebar.config'
import { APP_ROUTES, SNAPISTUDIO_ROUTES } from '@/constants/routes/routes'

export enum SidebarActiveType {
    HOME = 'home',
    EXPLORE = 'explore',
    FRIENDS = 'friends',
    FOLLOWING = 'following',
    UPLOAD = 'upload',
    ACTIVITY = 'activity',
    MESSAGES = 'messages',
    PROFILE = 'profile',
    MORE = 'more',
    SEARCH = 'search',
    NONE = 'none'
}

export interface SidebarActiveState {
    type: SidebarActiveType
    route?: string
}

export const routeToActiveType: Record<routesValuesType, SidebarActiveType> = {
    [APP_ROUTES.HOME]: SidebarActiveType.HOME,
    [APP_ROUTES.EXPLORE]: SidebarActiveType.EXPLORE,
    [APP_ROUTES.FRIENDS]: SidebarActiveType.FRIENDS,
    [APP_ROUTES.FOLLOWING]: SidebarActiveType.FOLLOWING,
    [APP_ROUTES.MESSAGES]: SidebarActiveType.MESSAGES,
    [SNAPISTUDIO_ROUTES.UPLOAD]: SidebarActiveType.UPLOAD
}
