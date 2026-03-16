"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function FullPageReload() {
    const pathName = usePathname();
    useEffect(() => {
        if (pathName) {
            window.location.href = pathName;
        }
    }, [pathName]);

    return null;
}
