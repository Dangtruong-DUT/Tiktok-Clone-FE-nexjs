import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCallback } from "react";
import { toast } from "sonner";
import { useDeletePostMutation } from "@/services/RTK/posts.services";

export default function AlertDialogDeleteDish({
    postIdDelete,
    setPostIdDelete,
}: {
    postIdDelete: string | null;
    setPostIdDelete: (value: string | null) => void;
}) {
    const [deletePostMutate, deletePostResult] = useDeletePostMutation();
    const handleDeletePost = useCallback(async () => {
        if (postIdDelete && deletePostResult.isLoading === false) {
            try {
                const res = await deletePostMutate(postIdDelete).unwrap();
                toast.success(res.message);
                setPostIdDelete(null);
            } catch (error) {
                console.log("error", error);
            }
        }
    }, [deletePostMutate, postIdDelete, setPostIdDelete, deletePostResult.isLoading]);
    return (
        <AlertDialog
            open={Boolean(postIdDelete)}
            onOpenChange={(value) => {
                if (!value) {
                    setPostIdDelete(null);
                }
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Post?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you certain you want to delete this post? Once deleted, you won’t be able to recover it.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeletePost} className="bg-red-500 text-white">
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
