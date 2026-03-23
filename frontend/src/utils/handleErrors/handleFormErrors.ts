import { isEntityError } from "@/helper/checkType";
import { FieldValues, Path, UseFormSetError } from "react-hook-form";

export function handleFormError<TFieldValues extends FieldValues>({
  error,
  setFormError,
}: {
  error: unknown;
  setFormError: UseFormSetError<TFieldValues>;
}) {
  if (isEntityError(error)) {
    const errors = error.data.errors;

    Object.entries(errors).forEach(([field, messages]) => {
      setFormError(field as Path<TFieldValues>, {
        type: "manual",
        message: Array.isArray(messages) ? messages[0] : String(messages),
      });
    });
  }
}
