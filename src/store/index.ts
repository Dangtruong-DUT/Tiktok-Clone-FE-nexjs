import { isProduction } from "@/config/app.config";
import { AuthApi } from "@/services/RTK/auth.services";
import { PostApi } from "@/services/RTK/posts.services";
import { SearchApi } from "@/services/RTK/search.services";
import { UploadApi } from "@/services/RTK/upload.services";
import { UserApi } from "@/services/RTK/user.services";
import authReducer from "@/store/features/authSlice";
import modalReducer from "@/store/features/modalSlide";
import videoReducer from "@/store/features/videoSlice";
import { authMiddleware, rtkQueryLogger } from "@/store/middleware";
import { configureStore } from "@reduxjs/toolkit";


export const makeStore = () => {
    return configureStore({
        devTools: !isProduction,
        reducer: {
            [UserApi.reducerPath]: UserApi.reducer,
            [SearchApi.reducerPath]: SearchApi.reducer,
            [UploadApi.reducerPath]: UploadApi.reducer,
            [AuthApi.reducerPath]: AuthApi.reducer,
            [PostApi.reducerPath]: PostApi.reducer,
            auth: authReducer,
            modal: modalReducer,
            video: videoReducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(
                UserApi.middleware,
                SearchApi.middleware,
                UploadApi.middleware,
                AuthApi.middleware,
                PostApi.middleware,
                authMiddleware,
                rtkQueryLogger
            ),
    });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export type storeApiType = { dispatch: AppDispatch; getState: () => RootState };

export function clearStore(dispatch: AppDispatch) {
    dispatch(UserApi.util.resetApiState());
    dispatch(AuthApi.util.resetApiState());
    dispatch(PostApi.util.resetApiState());
    dispatch(UploadApi.util.resetApiState());
}
