import SelectLanguage from "@/components/select-language";

export default function AuthFooter() {
    return (
        <footer className="flex items-center justify-between bg-black text-white px-4 h-[5.25rem] sm:px-[7rem]">
            <SelectLanguage />
            <strong className="font-semibold text-sm text-neutral-600">© 2025 TikTok</strong>
        </footer>
    );
}
