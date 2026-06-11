'use client'

import { useState } from 'react'

interface UseDialogReturn<TItem, TType extends string> {
    selectedItem: TItem | null
    dialogType: TType | null
    openDialog: (item: TItem, type: TType) => void
    closeDialog: () => void
}

export function useDialog<TItem, TType extends string>(): UseDialogReturn<TItem, TType> {
    const [selectedItem, setSelectedItem] = useState<TItem | null>(null)
    const [dialogType, setDialogType] = useState<TType | null>(null)

    const openDialog = (item: TItem, type: TType) => {
        setSelectedItem(item)
        setDialogType(type)
    }

    const closeDialog = () => {
        setSelectedItem(null)
        setDialogType(null)
    }

    return { selectedItem, dialogType, openDialog, closeDialog }
}
