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

export default function AlertDialogExitPage({
    isOpen,
    onCancel,
    onConfirm,
}: {
    isOpen: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    return (
        <AlertDialog
            open={isOpen}
            onOpenChange={(value) => {
                if (!value) {
                    onCancel();
                }
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to exit?</AlertDialogTitle>
                    <AlertDialogDescription>Your edits will not be saved.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onConfirm}>Exit</AlertDialogCancel>
                    <AlertDialogAction onClick={onCancel} className="bg-red-500 text-white">
                        Back to edits
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
