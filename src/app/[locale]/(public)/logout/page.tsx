import Logout from "@/app/[locale]/(public)/logout/logout";
import Loading from "@/components/lottie-icons/loading";

export default function LogoutPage() {
    return (
        <div className="m-auto flex flex-col items-center">
            <h1 className="text-center font-semibold text-3xl">Redirecting...</h1>
            <Loading loop className="size-18" />
            <Logout />
        </div>
    );
}
