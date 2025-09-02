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
            <div className="flex flex-col gap-4 mx-auto max-w-4xl w-full">
                <UpdateProfileForm />
                <ChangePasswordForm />
            </div>
        </div>
    );
}
