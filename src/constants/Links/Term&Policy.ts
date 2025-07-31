import { LinkItem } from "@/constants/Links/types";

const LINKS_FOR_TERM_POLICY: LinkItem[] = [
    {
        id: "tp01",
        name: "Help & Safety",
        href: "#helpSafety",
    },
    {
        id: "tp02",
        name: "Privacy Policy",
        href: "#privacyPolicy",
    },
    {
        id: "tp03",
        name: "Accessibility",
        href: "#accessibility",
    },
    {
        id: "tp04",
        name: "Privacy Center",
        href: "#privacyCenter",
    },
    {
        id: "tp05",
        name: "Creator Academy",
        href: "#creatorAcademy",
    },
    {
        id: "tp06",
        name: "Community Guidelines",
        href: "#communityGuidelines",
    },
    {
        id: "tp07",
        name: "Copyright ",
        href: "#copyright",
    },
    {
        id: "tp08",
        name: "Law Enforcement",
        href: "#lawEnforcement",
    },
] as const;

export default LINKS_FOR_TERM_POLICY;
