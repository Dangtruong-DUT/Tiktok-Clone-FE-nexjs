"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useTranslations } from "next-intl";
import { LoginReqBody, LoginReqBodyType } from "@/utils/validations/auth.schema";
import { Link, useRouter } from "@/i18n/navigation";
import { useLoginMutation } from "@/services/RTK/auth.services";
import { Loader } from "lucide-react";
import { handleFormError } from "@/utils/handleErrors/handleFormErrors";
import { toast } from "sonner";

export function LoginForm() {
    const t = useTranslations("LoginPage.email");
    const router = useRouter();

    const [loginMutate, loginResult] = useLoginMutation();

    const form = useForm<LoginReqBodyType>({
        resolver: zodResolver(LoginReqBody),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginReqBodyType) => {
        try {
            const result = await loginMutate(data).unwrap();
            router.push("/");
            toast.success(result.message);
        } catch (error) {
            handleFormError<LoginReqBodyType>({
                error,
                setFormError: form.setError,
            });
        }
    };
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-2.25">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input placeholder={t("emailPlaceholder")} {...field} className="brand-input " />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    placeholder={t("passwordPlaceholder")}
                                    {...field}
                                    className="brand-input"
                                    type="password"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Link href="/forgot-password" className="text-xs text-neutral-500  hover:underline block pb-4">
                    {t("forgotPassword")}
                </Link>
                <Button
                    type="submit"
                    className="primary-button w-full flex items-center justify-center [&_svg]:size-5!"
                    disabled={loginResult.isLoading}
                >
                    {loginResult.isLoading ? <Loader className="animate-spin font-semibold text-brand" /> : t("submit")}
                </Button>
            </form>
        </Form>
    );
}
