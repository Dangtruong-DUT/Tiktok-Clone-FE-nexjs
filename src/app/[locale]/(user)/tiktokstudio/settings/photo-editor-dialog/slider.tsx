"use client";

import { useEffect, useRef, useState } from "react";

interface SliderProps {
    value?: number;
    onChange?: (val: number) => void;
}

export default function Slider({ value, onChange }: SliderProps) {
    const [internalValue, setInternalValue] = useState(value ?? 50);
    const sliderRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (typeof value === "number") {
            setInternalValue(value);
        }
    }, [value]);

    const setValue = (val: number) => {
        const clamped = Math.min(100, Math.max(0, val));
        if (value === undefined) {
            setInternalValue(clamped);
        }
        onChange?.(clamped);
    };

    const updateValueFromClientX = (clientX: number) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const percent = ((clientX - rect.left) / rect.width) * 100;
        setValue(percent);
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        updateValueFromClientX(e.clientX);

        const handleMove = (ev: PointerEvent) => updateValueFromClientX(ev.clientX);
        const handleUp = () => {
            document.removeEventListener("pointermove", handleMove);
            document.removeEventListener("pointerup", handleUp);
        };

        document.addEventListener("pointermove", handleMove);
        document.addEventListener("pointerup", handleUp);
    };

    return (
        <div
            ref={sliderRef}
            className="relative w-[400px] h-[6px] rounded-full bg-gray-200 select-none"
            onPointerDown={handlePointerDown}
        >
            {/* progress */}
            <div
                className="absolute top-0 left-0 h-full rounded-full bg-brand"
                style={{ width: `${internalValue}%` }}
            />
            {/* thumb */}
            <div
                className="absolute top-1/2 w-4 h-4 rounded-full bg-brand shadow cursor-pointer"
                style={{
                    left: `${internalValue}%`,
                    transform: "translate(-50%, -50%)",
                }}
            />
        </div>
    );
}
