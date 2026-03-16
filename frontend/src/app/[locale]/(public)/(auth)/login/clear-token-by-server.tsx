"use client";

import { SearchParamsLoader, useSearchParamsLoader } from "@/components/searchparams-loader";
import { useAppDispatch } from "@/hooks/redux";
import { setLoggedOutAction } from "@/store/features/authSlice";
import { useEffect } from "react";

export default function ClearTokenByServer() {
    const { searchParams, setSearchParams } = useSearchParamsLoader();
    const dispatch = useAppDispatch();
    useEffect(() => {
        const clearToken = searchParams?.get("clearToken") === "true";
        if (clearToken) {
            dispatch(setLoggedOutAction());
        }
    }, [searchParams, dispatch]);
    return <SearchParamsLoader onParamsReceived={setSearchParams} />;
}
