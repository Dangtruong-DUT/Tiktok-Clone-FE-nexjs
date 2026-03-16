/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

const monthIndexes = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

function getDaysInMonth(month: number, year: number) {
    return new Date(year, month, 0).getDate();
}

type DateTimePickerProps = {
    className?: string;
    inputClassName?: string;
    onChange?: (value: string) => void;
    value?: string;
};

export default function DateTimePicker({ className = "", inputClassName = "", onChange, value }: DateTimePickerProps) {
    const t = useTranslations("datePicker");
    const [selectedDay, setSelectedDay] = useState<string>();
    const [selectedMonth, setSelectedMonth] = useState<string>();
    const [selectedYear, setSelectedYear] = useState<string>();

    const daysInMonth = useMemo(() => {
        if (!selectedMonth || !selectedYear)
            return Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, "0"));
        const days = getDaysInMonth(parseInt(selectedMonth), parseInt(selectedYear));
        return Array.from({ length: days }, (_, i) => (i + 1).toString().padStart(2, "0"));
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        if (selectedDay && !daysInMonth.includes(selectedDay)) {
            setSelectedDay("01");
        }
    }, [daysInMonth, selectedDay]);

    useEffect(() => {
        if (value) {
            const date = new Date(value);
            const year = date.getFullYear().toString();
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const day = date.getDate().toString().padStart(2, "0");
            setSelectedYear(year);
            setSelectedMonth(month);
            setSelectedDay(day);
        }
    }, [value]);

    useEffect(() => {
        if (onChange && selectedDay && selectedMonth && selectedYear) {
            const dateValue = `${selectedYear}-${selectedMonth}-${selectedDay}`;
            const iso = new Date(dateValue).toISOString();
            onChange(iso);
        }
    }, [selectedDay, selectedMonth, selectedYear, onChange]);

    return (
        <div className={cn("flex items-center justify-between gap-4", className)}>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className={cn("flex-1 brand-input", inputClassName)}>
                    <SelectValue placeholder={t("month")} />
                </SelectTrigger>
                <SelectContent>
                    {monthIndexes.map((index) => {
                        const value = index.padStart(2, "0");
                        return (
                            <SelectItem key={value} value={value}>
                                {t(`months.${index}` as any)}
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>

            <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className={cn("flex-1 brand-input", inputClassName)}>
                    <SelectValue placeholder={t("day")} />
                </SelectTrigger>
                <SelectContent>
                    {daysInMonth.map((day) => (
                        <SelectItem key={day} value={day}>
                            {day}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className={cn("flex-1 brand-input", inputClassName)}>
                    <SelectValue placeholder={t("year")} />
                </SelectTrigger>
                <SelectContent>
                    {years.map((year) => {
                        const value = year.toString();
                        return (
                            <SelectItem key={value} value={value}>
                                {year}
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
        </div>
    );
}
