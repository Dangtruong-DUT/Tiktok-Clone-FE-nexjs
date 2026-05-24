import { AiOutlineHome, AiOutlineCloudUpload, AiFillHome } from 'react-icons/ai'

import { HiOutlineUsers, HiOutlineUserGroup, HiUsers, HiUserGroup, HiCloudArrowUp } from 'react-icons/hi2'

import { IconType } from 'react-icons'
import { APP_ROUTES, SNAPISTUDIO_ROUTES } from '@/constants/routes/routes'
export const sidebarConfig = {
    routes: {
        home: APP_ROUTES.HOME,
        explore: APP_ROUTES.EXPLORE,
        friends: APP_ROUTES.FRIENDS,
        following: APP_ROUTES.FOLLOWING,
        messages: APP_ROUTES.MESSAGES,
        upload: SNAPISTUDIO_ROUTES.UPLOAD
    }
} as const

export type routesValuesType = (typeof sidebarConfig.routes)[keyof typeof sidebarConfig.routes]

export interface MenuItemConfig {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    titleKey: any
    to: routesValuesType
    Icon: IconType
    ActiveIcon?: IconType
    requiredAuth?: boolean
    viewFor: 'all' | 'authenticated'
}

export const HOME_MENU_ITEMS: MenuItemConfig[] = [
    {
        titleKey: 'HomePage.menu.forYou',
        to: sidebarConfig.routes.home,
        Icon: AiOutlineHome,
        ActiveIcon: AiFillHome,
        requiredAuth: false,
        viewFor: 'all'
    },
    {
        titleKey: 'HomePage.menu.friends',
        to: sidebarConfig.routes.friends,
        Icon: HiOutlineUserGroup,
        ActiveIcon: HiUserGroup,
        requiredAuth: true,
        viewFor: 'all'
    },
    {
        titleKey: 'HomePage.menu.following',
        to: sidebarConfig.routes.following,
        Icon: HiOutlineUsers,
        ActiveIcon: HiUsers,
        requiredAuth: true,
        viewFor: 'all'
    },
    {
        titleKey: 'HomePage.menu.upload',
        to: sidebarConfig.routes.upload,
        Icon: AiOutlineCloudUpload,
        ActiveIcon: HiCloudArrowUp,
        requiredAuth: true,
        viewFor: 'all'
    }
]
