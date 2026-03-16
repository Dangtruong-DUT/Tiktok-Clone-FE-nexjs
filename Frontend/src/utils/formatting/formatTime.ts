import { LocalesType } from "@/i18n/config";
import TimeAgo from "javascript-time-ago";

// English.
import en from "javascript-time-ago/locale/en";
import vi from "javascript-time-ago/locale/vi";

TimeAgo.addLocale(en);
TimeAgo.addLocale(vi);
TimeAgo.setDefaultLocale("en");

export function timeAgo({ locale, date }: { locale: LocalesType; date: string }) {
    try {
        const parsedDate = new Date(date);
        const timeAgo = new TimeAgo(locale);
        return timeAgo.format(parsedDate, "twitter-minute-now");
    } catch (error) {
        console.error("Error in timeAgo function:", error);
        return "";
    }
}

export function formatSecondsToTime(time: number): string {
    const minutes = Math.floor(time / 60).toString();
    const seconds = Math.floor(time % 60)
        .toString()
        .padStart(2, "0");
    return `${minutes}:${seconds}`;
}

export function timeToMMSSCS(time: number): string {
    const minutes = Math.floor(time / 60)
        .toString()
        .padStart(2, "0");
    const seconds = Math.floor(time % 60)
        .toString()
        .padStart(2, "0");
    const centiseconds = Math.floor((time % 1) * 100)
        .toString()
        .padStart(2, "0");
    return `${minutes}:${seconds}:${centiseconds}`;
}

export function formatISOToDisplayDate(data: string): string {
    try {
        const date = new Date(data);
        return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }).format(date);
    } catch (error) {
        console.log("Error in formatISOToDisplayDate function:", error);
        return "Invalid date";
    }
}
