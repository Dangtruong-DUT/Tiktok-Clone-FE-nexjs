"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useTranslations } from "next-intl";
import { RegisterBody, RegisterBodyType } from "@/utils/validations/auth.schema";

export default function SignUpForm() {
    const t = useTranslations("SignUpPage.email");

    const form = useForm<RegisterBodyType>({
        resolver: zodResolver(RegisterBody),
        defaultValues: {
            email: "",
            password: "",
            confirm_password: "",
            name: "",
            date_of_birth: "",
        },
    });

    const onSubmit = async (data: RegisterBodyType) => {
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

                <Button
                    type="submit"
                    className="h-11 rounded-xs bg-brand w-full mt-4 text-base font-semibold hover:bg-brand/90"
                >
                    {t("subtitle")}
                </Button>
            </form>
        </Form>
    );
}
