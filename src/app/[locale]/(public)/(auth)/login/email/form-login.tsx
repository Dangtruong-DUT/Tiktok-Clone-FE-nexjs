"use client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Loader } from "lucide-react";
import { useLoginWithEmail } from "@/hooks/data/useAuth";

export function LoginForm() {
    const t = useTranslations("LoginPage.email");
    const { form, onSubmit, loginResult } = useLoginWithEmail();
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
