import { Button } from "@/components/ui/button";
import { MdOutlinePublishedWithChanges } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FileInfoProps {
    file: File | null;
    onReplaceFile: () => void;
    className?: string;
}
export default function FileInfo({ file, onReplaceFile, className }: FileInfoProps) {
    if (!file) return null;

    const { name, size, type } = file;

    const handleReplace = (e: React.MouseEvent) => {
        e.preventDefault();
        onReplaceFile();
    };

    return (
        <div
            className={cn(
                "border border-border rounded-lg px-5 py-[27px] flex justify-between items-center",
                className
            )}
        >
            <div>
                <div>
                    <span className="font-bold text-base mr-2">{name}</span>
                    <Badge variant={"outline"}>{type}</Badge>
                </div>
                <div className="mt-2 text-green-400">{<span>{(size / (1024 * 1024)).toFixed(2)} MB</span>}</div>
            </div>
            <Button type="button" onClick={handleReplace} className="cursor-pointer">
                <MdOutlinePublishedWithChanges />
                Replace
            </Button>
        </div>
    );
}
