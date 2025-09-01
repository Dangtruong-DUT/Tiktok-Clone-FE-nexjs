import ChangePasswordForm from "@/app/[locale]/(user)/tiktokstudio/settings/change-password-form";
import UpdateProfileForm from "@/app/[locale]/(user)/tiktokstudio/settings/update-profile-form";
import { Badge } from "@/components/ui/badge";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("TiktokStudio.settings");

    return {
        title: t("page.title"),
        keywords: "manage, settings",
    };
}

export default async function Setting() {
    const t = await getTranslations("TiktokStudio.settings");

    return (
        <div className="grid flex-1 items-start gap-4 p-4 sm:px-6  md:gap-8">
            <div className="mx-auto grid w-full flex-1 auto-rows-max gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-bold tracking-tight sm:grow-0">
                        {t("page.title")}
                    </h1>
                    <Badge variant="default" className="ml-auto sm:ml-0">
                        {t("page.userBadge")}
                    </Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2 md:gap-8">
                    <UpdateProfileForm />
                    <ChangePasswordForm />
                </div>
            </div>
        </div>
    );
}
