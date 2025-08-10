import { GoBack } from "@/app/[locale]/(public)/(auth)/button-go-back";
import SignUpForm from "@/app/[locale]/(public)/(home)/@modal/(auth)/(.)signup/email/sign-up-form";
import { getTranslations } from "next-intl/server";

export default async function EmailSignUpPage() {
    const t = await getTranslations("SignUpPage");
    return (
        <div className="w-full">
            <h1 className="text-3xl my-4 font-bold text-center mt-16">{t("title")}</h1>
            <SignUpForm />
            <GoBack />
        </div>
    );
}
