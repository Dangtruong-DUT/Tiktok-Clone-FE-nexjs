"use client";

import * as React from "react";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useLocale, useTranslations } from "next-intl";
import { LANGUAGES } from "@/i18n/config";
import useLanguage from "@/hooks/shared/useLanguage";

export default function SelectLanguage() {
    const t = useTranslations();
    const locale = useLocale();

    const { onChange, isPending } = useLanguage();

    return (
        <Select value={locale} onValueChange={onChange} disabled={isPending}>
            <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("SwitchLanguage.label")} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>{t("SwitchLanguage.label")}</SelectLabel>
                    {LANGUAGES.map(({ value, labelKey }) => (
                        <SelectItem key={value} value={value}>
                            {t(`SwitchLanguage.${labelKey}` as "SwitchLanguage.en" | "SwitchLanguage.vi")}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
