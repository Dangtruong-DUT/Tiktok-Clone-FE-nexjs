import FullLogo from "@/components/full-logo";
import SmallLogo from "@/components/small-logo";

type LogoBrandProps = {
    className?: string;
    width?: string;
    height?: string;
    color?: string;
    small?: boolean;
};

function LogoBrand({ className, width = "118", height = "42", color = "currentColor", small = false }: LogoBrandProps) {
    return small ? (
        <SmallLogo className={className} height={height} color={color} />
    ) : (
        <FullLogo className={className} width={width} height={height} color={color} />
    );
}

export default LogoBrand;
