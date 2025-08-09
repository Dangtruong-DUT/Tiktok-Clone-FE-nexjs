"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useTranslations } from "next-intl";
import { LoginReqBody, LoginReqBodyType } from "@/utils/validations/auth.schema";
import { Link } from "@/i18n/navigation";

export function LoginForm() {
    const t = useTranslations("LoginPage.email");

    const form = useForm<LoginReqBodyType>({
        resolver: zodResolver(LoginReqBody),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginReqBodyType) => {
        toast.error("This feature is not implemented yet.");
        console.log("Form submitted with data:", data);
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
                                <Input placeholder={t("passwordPlaceholder")} {...field} className="brand-input" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Link href="/forgot-password" className="text-xs text-neutral-500  hover:underline">
                    {t("forgotPassword")}
                </Link>
                <Button type="submit" className="primary-button w-full" disabled={false}>
                    {t("submit")}
                </Button>
            </form>
        </Form>
    );
}
