import { Audience } from "@/constants/enum";

export function getAudienceNameFromEnum(audience: Audience) {
    switch (audience) {
        case Audience.PUBLIC:
            return "Public";
        case Audience.FRIENDS:
            return "Friends";
        case Audience.PRIVATE:
            return "Private";
        default:
            return "Unknown";
    }
}
