import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function scrollTo(element: Element | null) {
    if (!element) return;

    element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
    });
}
