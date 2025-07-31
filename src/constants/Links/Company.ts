import { LinkItem } from "@/constants/Links/types";

const LINKS_FOR_COMPANY: LinkItem[] = [
    {
        id: "c01",
        name: "About",
        href: "#About",
    },
    {
        id: "c02",
        name: "Newsroom",
        href: "#Newsroom",
    },
    {
        id: "c03",
        name: "Contact",
        href: "#Contact",
    },
    {
        id: "c04",
        name: "Careers",
        href: "#Careers",
    },
] as const;

export default LINKS_FOR_COMPANY;
