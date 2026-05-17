import { isProduction } from '@/config/app.config'
import { AppealApi } from '@/store/services/appeal.service'
import { AdminApi } from '@/store/services/admin/admin-api.service'
import { AuthApi } from '@/store/services/auth.service'
import { NotificationApi } from '@/store/services/notification.service'
import { PostApi } from '@/store/services/posts.service'
import { SearchApi } from '@/store/services/search.service'
import { UploadApi } from '@/store/services/upload.service'
import { UserApi } from '@/store/services/user.service'
import authReducer from '@/store/features/authSlice'
import appReducer, { clearAllLoading } from '@/store/features/appSlice'
import modalReducer from '@/store/features/modalSlide'
import videoReducer from '@/store/features/videoSlice'
import { configureStore } from '@reduxjs/toolkit'
import { errorHandleMiddleware } from './middlewares/errorHandling.middleware'
import { authMiddleware } from './middlewares/auth.middleware'

export const makeStore = () => {
    return configureStore({
        devTools: isProduction ? false : true,
        reducer: {
            [UserApi.reducerPath]: UserApi.reducer,
            [SearchApi.reducerPath]: SearchApi.reducer,
            [UploadApi.reducerPath]: UploadApi.reducer,
            [AuthApi.reducerPath]: AuthApi.reducer,
            [PostApi.reducerPath]: PostApi.reducer,
            [NotificationApi.reducerPath]: NotificationApi.reducer,
            [AdminApi.reducerPath]: AdminApi.reducer,
            [AppealApi.reducerPath]: AppealApi.reducer,
            auth: authReducer,
            app: appReducer,
            modal: modalReducer,
            video: videoReducer
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(
                UserApi.middleware,
                SearchApi.middleware,
                UploadApi.middleware,
                AuthApi.middleware,
                PostApi.middleware,
                NotificationApi.middleware,
                AdminApi.middleware,
                AppealApi.middleware,
                authMiddleware,
                errorHandleMiddleware
            )
    })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

export type storeApiType = { dispatch: AppDispatch; getState: () => RootState }

export function clearStore(dispatch: AppDispatch) {
    dispatch(UserApi.util.resetApiState())
    dispatch(AuthApi.util.resetApiState())
    dispatch(PostApi.util.resetApiState())
    dispatch(NotificationApi.util.resetApiState())
    dispatch(AdminApi.util.resetApiState())
    dispatch(AppealApi.util.resetApiState())
    dispatch(UploadApi.util.resetApiState())
    dispatch(clearAllLoading())
}
