import RefreshToken from "@/app/[locale]/(public)/refresh-token/refresh-token";
import Loading from "@/components/lottie-icons/loading";

export default function RefreshTokenPage() {
    return (
        <div className="m-auto flex flex-col items-center">
            <h1 className="text-center font-semibold text-3xl">Redirecting...</h1>
            <Loading loop className="size-18" />
            <RefreshToken />
        </div>
    );
}
