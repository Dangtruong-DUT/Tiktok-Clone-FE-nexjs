'use client'
import { AppStore, makeStore } from '@/store'
import { setLang } from '@/store/features/appSlice'
import { LocalesType } from '@/i18n/config'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { setupListeners } from '@reduxjs/toolkit/query'

interface StoreProviderProps {
    children: React.ReactNode
    locale: LocalesType
}

export default function StoreProvider({ children, locale }: StoreProviderProps) {
    const storeRef = useRef<AppStore>(null)
    if (!storeRef.current) {
        storeRef.current = makeStore()
        setupListeners(storeRef.current.dispatch)
        storeRef.current.dispatch(setLang(locale))
    }

    return <Provider store={storeRef.current}>{children}</Provider>
}
