"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit3 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useUpdateMeMutation } from "@/services/RTK/user.services";
import { UpdateUserBody, UpdateUserBodyType } from "@/utils/validations/user.schema";
import { useEffect, useState } from "react";
import useCurrentUserData from "@/hooks/data/useCurrentUserData";
import { handleFormError } from "@/utils/handleErrors/handleFormErrors";

export default function EditProfileDialog() {
    const [open, setOpen] = useState(false);
    const currentUser = useCurrentUserData();
    const [updateProfile] = useUpdateMeMutation();

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
        try {
            await updateProfile(values).unwrap();
            setOpen(false);
        } catch (error) {
            handleFormError<UpdateUserBodyType>({
                error,
                setFormError: form.setError,
            });
        }
    }

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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Username" />
                                    </FormControl>
                                    <p className="text-sm text-muted-foreground">www.tiktok.com/@{field.value}</p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Name" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bio</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="Bio" className="resize-none" maxLength={80} />
                                    </FormControl>
                                    <div className="text-sm text-muted-foreground text-right">
                                        {field.value?.length || 0}/80
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Save</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
