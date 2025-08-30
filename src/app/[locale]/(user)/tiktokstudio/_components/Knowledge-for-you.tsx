import Image from "next/image";
import { FaChevronRight } from "react-icons/fa6";

export default function KnowledgeForYou() {
    return (
        <div className="min-w-[336px]">
            <div className="text-base font-bold flex justify-between items-center">
                <span className="flex items-center gap-2 cursor-pointer">
                    Knowledge for you
                    <FaChevronRight />
                </span>
            </div>
            <div className="bg-card border rounded-lg border-border mt-4">
                <Image
                    src={"/images/Knowledge for you.png"}
                    alt="Knowledge for you"
                    width={336}
                    height={64}
                    className="rounded-md object-cover w-full"
                />
            </div>
        </div>
    );
}
