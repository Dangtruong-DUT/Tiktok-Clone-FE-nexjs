import { useAppSelector } from "@/hooks/redux";
import { useGetMeQuery } from "@/services/RTK/user.services";
import { useMemo } from "react";

export default function useCurrentUserData() {
    const role = useAppSelector((state) => state.auth.role);
    const userFromStore = useAppSelector((state) => state.auth.user_profile);
    const { data: getMeRes } = useGetMeQuery(undefined, { skip: role == null });
    const userFromServer = getMeRes?.data;

    const user = useMemo(() => {
        if (userFromServer) return userFromServer;
        return userFromStore;
    }, [userFromServer, userFromStore]);

    return user;
}
