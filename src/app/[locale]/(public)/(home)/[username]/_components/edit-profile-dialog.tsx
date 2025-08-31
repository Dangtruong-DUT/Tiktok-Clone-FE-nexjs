"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit3, Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useUpdateMeMutation } from "@/services/RTK/user.services";
import { UpdateUserBody, UpdateUserBodyType } from "@/utils/validations/user.schema";
import { useEffect, useState } from "react";
import useCurrentUserData from "@/hooks/data/useCurrentUserData";
import { handleFormError } from "@/utils/handleErrors/handleFormErrors";
import envConfig from "@/config/app.config";
import { usePathname, useRouter } from "@/i18n/navigation";
import { clearStore } from "@/store";
import { useAppDispatch } from "@/hooks/redux";

export default function EditProfileDialog() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const currentUser = useCurrentUserData();
    const [updateProfile, updateProfileResult] = useUpdateMeMutation();

    const form = useForm<UpdateUserBodyType>({
        resolver: zodResolver(UpdateUserBody),
        defaultValues: {
            username: "",
            name: "",
            bio: "",
            avatar: "",
        },
    });

    useEffect(() => {
        if (currentUser) {
            form.reset({
                username: currentUser.username,
                name: currentUser.name,
                bio: currentUser.bio,
                avatar: currentUser.avatar,
            });
        }
    }, [currentUser, form]);

    async function onSubmit(values: UpdateUserBodyType) {
        if (updateProfileResult.isLoading || !currentUser) return;
        try {
            const oldUsername = currentUser.username;

            await updateProfile(values).unwrap();
            if (typeof pathname === "string" && typeof values?.username === "string") {
                const newURL = pathname.replace(oldUsername, values.username);
                router.replace(newURL);
            } else {
                router.refresh();
            }
            clearStore(dispatch);
            setOpen(false);
        } catch (error) {
            handleFormError<UpdateUserBodyType>({
                error,
                setFormError: form.setError,
            });
        }
    }

    const onReset = () => {
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="primary-button h-10! rounded-md! text-base! font-medium! cursor-pointer"
                >
                    <span className="flex justify-center items-center mr-1">
                        <Edit3 size={19} />
                    </span>
                    <span className="max-md:hidden">Edit profile</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="px-8 py-4 border-b">
                    <DialogTitle className="text-xl font-semibold">Edit profile</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} onReset={onReset} className="px-8 py-4">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem className="mb-6">
                                    <FormLabel className="text-base font-semibold">Username</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Username" className="h-11 text-base" />
                                    </FormControl>
                                    <FormMessage />
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {envConfig.NEXT_PUBLIC_URL}@{field.value}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Usernames can only contain letters, numbers, underscores and periods. Changing
                                        your username will also change your profile link.
                                    </p>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="mb-6">
                                    <FormLabel className="text-base font-semibold">Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Name" className="h-11 text-base" />
                                    </FormControl>
                                    <FormMessage />
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Your nickname can only be changed once every 7 days.
                                    </p>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem className="mb-6">
                                    <FormLabel className="text-base font-semibold">Bio</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Bio"
                                            className="resize-none min-h-[120px] text-base"
                                            maxLength={80}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <div className="text-sm text-muted-foreground text-right mt-1">
                                        {field.value?.length || 0}/80
                                    </div>
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button type="reset" variant="outline" className="h-8 px-8 w-[96px] text-sm font-semibold">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="h-8  w-[96px] px-8 text-sm font-semibold bg-brand hover:bg-brand/90 text-white"
                                disabled={updateProfileResult.isLoading}
                            >
                                {updateProfileResult.isLoading ? <Loader className="animate-spin" /> : "Save"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
