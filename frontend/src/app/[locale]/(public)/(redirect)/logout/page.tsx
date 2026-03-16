import Logout from "@/app/[locale]/(public)/(redirect)/logout/logout";
import Loading from "@/components/lottie-icons/loading";

export default function LogoutPage() {
    return (
        <div className="m-auto flex flex-col items-center">
            <Loading loop className="size-18" />
            <h1 className="text-center font-semibold text-xl">Redirecting...</h1>
            <Logout />
        </div>
    );
}
