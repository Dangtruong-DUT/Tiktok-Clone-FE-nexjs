import { SidebarActiveType } from '@/app/[locale]/(public)/(home)/_components/sidebar/_types/sidebar.types'
import { IconType } from 'react-icons'
import { HiBell, HiEllipsisHorizontalCircle, HiOutlineBell, HiOutlineEllipsisHorizontalCircle } from 'react-icons/hi2'

export type SidebarActionMenuKey = 'activity' | 'more'
export type SidebarActionMenuPlacement = 'before-profile' | 'after-profile'

export interface SidebarActionMenuItemConfig {
    key: SidebarActionMenuKey
    titleKey: 'activity' | 'more'
    icon: IconType
    activeIcon: IconType
    activeType: SidebarActiveType
    placement: SidebarActionMenuPlacement
    requiredAuth: boolean
}

export const SIDEBAR_ACTION_MENU_ITEMS: SidebarActionMenuItemConfig[] = [
    {
        key: 'activity',
        titleKey: 'activity',
        icon: HiOutlineBell,
        activeIcon: HiBell,
        activeType: SidebarActiveType.ACTIVITY,
        placement: 'before-profile',
        requiredAuth: true
    },
    {
        key: 'more',
        titleKey: 'more',
        icon: HiOutlineEllipsisHorizontalCircle,
        activeIcon: HiEllipsisHorizontalCircle,
        activeType: SidebarActiveType.MORE,
        placement: 'after-profile',
        requiredAuth: false
    }
]
