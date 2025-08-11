import { AuthApi } from "@/services/RTK/auth.services";
import { UserApi } from "@/services/RTK/user.services";
import authReducer from "@/store/features/authSlice";
import modalReducer from "@/store/features/modalSlide";
import { authMiddleware, rtkQueryLogger } from "@/store/middleware";
import { configureStore } from "@reduxjs/toolkit";

export const makeStore = () => {
    return configureStore({
        reducer: {
            [AuthApi.reducerPath]: AuthApi.reducer,
            [UserApi.reducerPath]: UserApi.reducer,
            auth: authReducer,
            modal: modalReducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(AuthApi.middleware, UserApi.middleware, authMiddleware, rtkQueryLogger),
    });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export type storeApiType = { dispatch: AppDispatch; getState: () => RootState };
