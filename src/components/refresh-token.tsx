"use client ";

import useRefreshToken from "@/hooks/data/useRefreshToken";
import { useEffect, useRef } from "react";

const INTERVAL_REFRESH = 1000 * 30; // time interval must be less than access token expiration

export default function RefreshToken() {
    const timer = useRef<NodeJS.Timeout | null>(null);
    const { refreshToken } = useRefreshToken();
    useEffect(() => {
        refreshToken();
        timer.current = setInterval(() => {
            refreshToken();
        }, INTERVAL_REFRESH);
        return () => {
            if (timer.current) {
                clearInterval(timer.current);
            }
        };
    }, [refreshToken]);
    return null;
}
