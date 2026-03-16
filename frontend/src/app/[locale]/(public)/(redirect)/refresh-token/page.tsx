import RefreshToken from "@/app/[locale]/(public)/(redirect)/refresh-token/refresh-token";
import Loading from "@/components/lottie-icons/loading";

export default function RefreshTokenPage() {
    return (
        <div className="m-auto flex flex-col items-center">
            <Loading loop className="size-18" />
            <h1 className="text-center font-semibold text-xl">Redirecting...</h1>
            <RefreshToken />
        </div>
    );
}
