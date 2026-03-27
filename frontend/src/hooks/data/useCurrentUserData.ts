import { useAppSelector } from '@/store/hooks'
import { useGetMeQuery } from '@/store/services/user.service'
import { useMemo } from 'react'

export default function useCurrentUserData() {
    const role = useAppSelector((state) => state.auth.role)

    const userFromStore = useAppSelector((state) => state.auth.user_profile)
    const { data: getMeRes } = useGetMeQuery(undefined, {
        skip: role == null || role == undefined
    })
    const userFromServer = getMeRes?.data

    const user = useMemo(() => {
        if (userFromServer) return userFromServer
        return userFromStore
    }, [userFromServer, userFromStore])

    if (role == null || role == undefined) return null

    return user
}
