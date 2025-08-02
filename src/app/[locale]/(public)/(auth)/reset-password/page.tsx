import ResetPasswordForm from "@/app/[locale]/(public)/(auth)/reset-password/reset-password-form";
import { getTranslations } from "next-intl/server";

export default async function ResetPasswordPage() {
    const t = await getTranslations("resetPasswordPage");
    return (
        <div className="w-full max-w-sm mx-auto px-4 ">
            <h1 className="text-3xl my-4 font-bold text-center mt-16">{t("title")}</h1>
            <ResetPasswordForm />
        </div>
    );
}
