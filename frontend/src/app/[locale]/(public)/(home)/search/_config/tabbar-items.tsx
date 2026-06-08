import { SearchTabId, SearchTabIdType } from '@/constants/ui/search'

export interface TabItem {
    label: string
    id: SearchTabIdType
}

export const TAB_ITEMS: TabItem[] = [
    { label: 'Users', id: SearchTabId.USERS },
    { label: 'Videos', id: SearchTabId.VIDEOS }
]
