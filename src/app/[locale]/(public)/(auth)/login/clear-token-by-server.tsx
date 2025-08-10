"use client";

import { SearchParamsLoader, useSearchParamsLoader } from "@/components/searchparams-loader";
import { useAppDispatch } from "@/hooks/redux";
import { clearToken as clearTokenAction, setRole } from "@/store/features/authSlice";
import { useEffect } from "react";

export default function ClearTokenByServer() {
    const { searchParams, setSearchParams } = useSearchParamsLoader();
    const dispatch = useAppDispatch();
    useEffect(() => {
        const clearToken = searchParams?.get("clearToken") === "true";
        if (clearToken) {
            dispatch(clearTokenAction());
            dispatch(setRole(null));
        }
    }, [searchParams, dispatch]);
    return <SearchParamsLoader onParamsReceived={setSearchParams} />;
}
