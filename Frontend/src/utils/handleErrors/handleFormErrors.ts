import { isEntityError } from "@/helper/checkType";
import { FieldValues, UseFormSetError } from "react-hook-form";

export function handleFormError<TFieldValues extends FieldValues>({
    error,
    setFormError,
}: {
    error: unknown;
    setFormError: UseFormSetError<TFieldValues>;
}) {
    if (isEntityError(error)) {
        Object.values(error.data.errors).forEach((err) => {
            setFormError(err.path as import("react-hook-form").Path<TFieldValues>, {
                type: "manual",
                message: err.msg,
            });
        });
    }
}
