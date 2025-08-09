import { AuthApi } from "@/services/RTK/auth.services";
import authReducer from "@/store/features/authSlice";
import { rtkQueryAuthMiddleware } from "@/store/middleware";
import { configureStore } from "@reduxjs/toolkit";

export const makeStore = () => {
    return configureStore({
        reducer: {
            [AuthApi.reducerPath]: AuthApi.reducer,
            auth: authReducer,
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(AuthApi.middleware, rtkQueryAuthMiddleware),
    });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export type storeApiType = { dispatch: AppDispatch; getState: () => RootState };
