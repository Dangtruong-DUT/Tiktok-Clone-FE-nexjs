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
import { useParams } from "next/navigation";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LANGUAGES, LocalesType } from "@/i18n/config";

export default function SelectLanguage() {
    const t = useTranslations();
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const params = useParams();

    const [isPending, startTransition] = useTransition();

    function onChange(value: string) {
        const nextLocale = value as LocalesType;

        startTransition(() => {
            router.replace(
                // @ts-expect-error -- TypeScript will validate that only known `params`
                // are used in combination with a given `pathname`. Since the two will
                // always match for the current route, we can skip runtime checks.
                { pathname, params },
                { locale: nextLocale }
            );
        });
    }

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
