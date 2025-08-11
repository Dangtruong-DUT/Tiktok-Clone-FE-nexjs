import SelectLanguage from "@/components/select-language";
import { cn } from "@/lib/utils";

interface FooterProps {
    classname?: string;
}

export default function Footer({ classname }: FooterProps) {
    return (
        <footer className={cn("flex items-center justify-between px-4 h-[5.25rem] sm:px-[7rem]", classname)}>
            <SelectLanguage />
            <strong className="font-semibold text-sm text-neutral-600">© 2025 TikTok</strong>
        </footer>
    );
}
