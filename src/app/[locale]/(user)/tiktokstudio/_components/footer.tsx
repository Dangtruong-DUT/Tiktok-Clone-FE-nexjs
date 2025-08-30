export default function Footer() {
    return (
        <footer className=" border-t border-border p-8 flex justify-between items-center">
            <span className="text-muted-foreground text-xs">Copyright © 2025 TikTok</span>
            <div className="flex gap-6">
                <a href="!#" className="text-muted-foreground text-xs">
                    Privacy Policy
                </a>
                <a href="!#" className="text-muted-foreground text-xs">
                    Terms of Service
                </a>
            </div>
        </footer>
    );
}
