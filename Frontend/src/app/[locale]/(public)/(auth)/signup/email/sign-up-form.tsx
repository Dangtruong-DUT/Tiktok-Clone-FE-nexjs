"use client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

import { useTranslations } from "next-intl";
import DateTimePicker from "@/components/date-time-picker";
import { Loader } from "lucide-react";
import { useRegisterWithEmail } from "@/hooks/data/useAuth";

export default function SignUpForm() {
    const t = useTranslations("SignUpPage.email");
    const { form, onSubmit, registerResult } = useRegisterWithEmail();

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-2.25">
                <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("dateOfBirthLabel")}</FormLabel>
                            <FormControl>
                                <DateTimePicker {...field} />
                            </FormControl>
                            <FormDescription>{t("dateOfBirthDescription")}</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input placeholder={t("namePlaceholder")} {...field} className="brand-input " />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
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
                                <PasswordInput
                                    placeholder={t("passwordPlaceholder")}
                                    {...field}
                                    className="brand-input"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirm_password"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <PasswordInput
                                    placeholder={t("confirmPasswordPlaceholder")}
                                    {...field}
                                    className="brand-input"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="primary-button w-full flex items-center justify-center [&_svg]:size-5!"
                    disabled={registerResult.isLoading}
                >
                    {registerResult.isLoading ? (
                        <Loader className="animate-spin font-semibold text-brand" />
                    ) : (
                        t("submit")
                    )}
                </Button>
            </form>
        </Form>
    );
}
