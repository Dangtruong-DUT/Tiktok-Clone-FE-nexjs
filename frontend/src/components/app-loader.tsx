import LoadingIcon from "@/components/lottie-icons/loading";

export default function AppLoader() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]">
            <LoadingIcon className="m-auto size-18" loop />
        </div>
    );
}
