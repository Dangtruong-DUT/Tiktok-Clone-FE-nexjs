export const SidebarMenuKey = {
    ACTIVITY: 'activity',
    MORE: 'more'
} as const

export type SidebarMenuKeyType = (typeof SidebarMenuKey)[keyof typeof SidebarMenuKey]

export const SidebarMenuPlacement = {
    BEFORE_PROFILE: 'before-profile',
    AFTER_PROFILE: 'after-profile'
} as const

export type SidebarMenuPlacementType = (typeof SidebarMenuPlacement)[keyof typeof SidebarMenuPlacement]
