"use client";

import { useCallback, useState } from "react";

export function useTemporaryIcon(timeout = 500) {
    const [show, setShow] = useState(false);

    const trigger = useCallback(() => {
        setShow(true);
        setTimeout(() => setShow(false), timeout);
    }, [timeout]);

    return { show, trigger };
}
