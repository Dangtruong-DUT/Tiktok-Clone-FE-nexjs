export const AdminSettingsTab = {
    PROFILE: 'profile',
    SECURITY: 'security'
} as const

export type AdminSettingsTabType = (typeof AdminSettingsTab)[keyof typeof AdminSettingsTab]

export const UserSettingsTab = {
    PROFILE: 'profile',
    SECURITY: 'security',
    PRIVACY: 'privacy',
    EMAIL: 'email'
} as const

export type UserSettingsTabType = (typeof UserSettingsTab)[keyof typeof UserSettingsTab]
