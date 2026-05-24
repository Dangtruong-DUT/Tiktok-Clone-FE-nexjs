import { SidebarActiveType } from '@/app/[locale]/(public)/(home)/_components/sidebar/_types/sidebar.types'
import {
    SidebarMenuKey,
    SidebarMenuKeyType,
    SidebarMenuPlacement,
    SidebarMenuPlacementType
} from '@/constants/ui/sidebar'
import { IconType } from 'react-icons'
import { HiBell, HiEllipsisHorizontalCircle, HiOutlineBell, HiOutlineEllipsisHorizontalCircle } from 'react-icons/hi2'

export interface SidebarActionMenuItemConfig {
    key: SidebarMenuKeyType
    titleKey: SidebarMenuKeyType
    icon: IconType
    activeIcon: IconType
    activeType: SidebarActiveType
    placement: SidebarMenuPlacementType
    requiredAuth: boolean
}

export const SIDEBAR_ACTION_MENU_ITEMS: SidebarActionMenuItemConfig[] = [
    {
        key: SidebarMenuKey.ACTIVITY,
        titleKey: SidebarMenuKey.ACTIVITY,
        icon: HiOutlineBell,
        activeIcon: HiBell,
        activeType: SidebarActiveType.ACTIVITY,
        placement: SidebarMenuPlacement.BEFORE_PROFILE,
        requiredAuth: true
    },
    {
        key: SidebarMenuKey.MORE,
        titleKey: SidebarMenuKey.MORE,
        icon: HiOutlineEllipsisHorizontalCircle,
        activeIcon: HiEllipsisHorizontalCircle,
        activeType: SidebarActiveType.MORE,
        placement: SidebarMenuPlacement.AFTER_PROFILE,
        requiredAuth: false
    }
]
