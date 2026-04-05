import { routesValuesType } from '@/app/[locale]/(public)/(home)/_components/sidebar/_config/menu-items-sidebar.config'

export enum SidebarActiveType {
    // Navigation items
    HOME = 'home',
    EXPLORE = 'explore',
    FRIENDS = 'friends',
    FOLLOWING = 'following',
    UPLOAD = 'upload',
    ACTIVITY = 'activity',
    MESSAGES = 'messages',

    // Special actions
    PROFILE = 'profile',
    MORE = 'more',
    SEARCH = 'search',

    // Default state
    NONE = 'none'
}

export interface SidebarActiveState {
    type: SidebarActiveType
    route?: string
}

export const routeToActiveType: Record<routesValuesType, SidebarActiveType> = {
    '/': SidebarActiveType.HOME,
    '/explore': SidebarActiveType.EXPLORE,
    '/friends': SidebarActiveType.FRIENDS,
    '/following': SidebarActiveType.FOLLOWING,
    '/messages': SidebarActiveType.MESSAGES,
    '/snapistudio/upload': SidebarActiveType.UPLOAD
}
