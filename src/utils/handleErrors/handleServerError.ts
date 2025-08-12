export function handleErrorApiOnNextServer(error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).digest?.includes("NEXT_REDIRECT")) throw error;
    console.error("Error fetching data:", error);
}

type WrapperServerCallApiProps<T> = {
    apiCallFn: () => Promise<T>;
    onError?: (error: unknown) => void;
    onSuccess?: (data: T) => void;
};

export const WrapperServerCallApi = async <T>({
    apiCallFn,
    onError,
    onSuccess,
}: WrapperServerCallApiProps<T>): Promise<null | T> => {
    let result: null | T = null;
    try {
        result = await apiCallFn();
        onSuccess?.(result);
    } catch (error) {
        handleErrorApiOnNextServer(error);
        onError?.(error);
    }
    return result;
};
