"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import DateTimePicker from "@/components/date-time-picker";
import { RegisterReqBody, RegisterReqBodyType } from "@/utils/validations/auth.schema";

export function ModalSignUpForm() {
    const t = useTranslations("SignUpPage.email");

    const form = useForm<RegisterReqBodyType>({
        resolver: zodResolver(RegisterReqBody),
        defaultValues: {
            email: "",
            password: "",
            confirm_password: "",
            name: "",
            date_of_birth: "",
        },
    });

    const onSubmit = async (data: RegisterReqBodyType) => {
        toast.error("This feature is not implemented yet.");
        console.log("Form submitted with data:", data);
    };

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
                                <DateTimePicker {...field} inputClassName="bg-card! border-none!" />
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
                                <Input
                                    placeholder={t("namePlaceholder")}
                                    {...field}
                                    className="brand-input bg-card! border-none!"
                                />
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
                                <Input
                                    placeholder={t("emailPlaceholder")}
                                    {...field}
                                    className="brand-input bg-card! border-none!"
                                />
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
                                    className="brand-input bg-card! border-none!"
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
                                <Input
                                    placeholder={t("confirmPasswordPlaceholder")}
                                    {...field}
                                    className="brand-input bg-card! border-none!"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="primary-button w-full">
                    {t("submit")}
                </Button>
            </form>
        </Form>
    );
}
