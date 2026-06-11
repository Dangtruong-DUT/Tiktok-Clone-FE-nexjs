import { AppealApi } from '@/store/services/user/appeal.service'
import { AdminApi } from '@/store/services/admin/admin-api.service'
import { AdminAiStudioApi } from '@/store/services/admin/admin-ai-studio.service'
import { AdminScheduledPostsApi } from '@/store/services/admin/admin-scheduled-posts.service'
import { AiCopilotApi } from '@/store/services/ai/ai-copilot.service'
import { AdminAiCopilotApi } from '@/store/services/admin/admin-ai-copilot.service'
import { AdminAiKnowledgeApi } from '@/store/services/admin/admin-ai-knowledge.service'
import { AuthApi } from '@/store/services/user/auth.service'
import { NotificationApi } from '@/store/services/discovery/notification.service'
import { PostApi } from '@/store/services/content/posts.service'
import { SearchApi } from '@/store/services/discovery/search.service'
import { ScreenTimeApi } from '@/store/services/wellness/screen-time.service'
import { StudioPostScheduleApi } from '@/store/services/content/studio-post-schedule.service'
import { UploadApi } from '@/store/services/content/upload.service'
import { UserApi } from '@/store/services/user/user.service'
import { WellnessRuleApi } from '@/store/services/wellness/wellness-rule.service'
import authReducer from '@/store/features/authSlice'
import appReducer, { clearAllLoading } from '@/store/features/appSlice'
import modalReducer from '@/store/features/modalSlide'
import videoReducer from '@/store/features/videoSlice'
import videoProcessingReducer from '@/store/features/videoProcessingSlice'
import wellnessReducer from '@/store/features/wellnessSlice'
import { configureStore } from '@reduxjs/toolkit'
import { errorHandleMiddleware } from './middlewares/errorHandling.middleware'
import { authMiddleware } from './middlewares/auth.middleware'

export const makeStore = () => {
    return configureStore({
        devTools: true,
        reducer: {
            [UserApi.reducerPath]: UserApi.reducer,
            [SearchApi.reducerPath]: SearchApi.reducer,
            [UploadApi.reducerPath]: UploadApi.reducer,
            [AuthApi.reducerPath]: AuthApi.reducer,
            [PostApi.reducerPath]: PostApi.reducer,
            [NotificationApi.reducerPath]: NotificationApi.reducer,
            [AdminApi.reducerPath]: AdminApi.reducer,
            [AppealApi.reducerPath]: AppealApi.reducer,
            [AdminAiStudioApi.reducerPath]: AdminAiStudioApi.reducer,
            [AdminScheduledPostsApi.reducerPath]: AdminScheduledPostsApi.reducer,
            [StudioPostScheduleApi.reducerPath]: StudioPostScheduleApi.reducer,
            [ScreenTimeApi.reducerPath]: ScreenTimeApi.reducer,
            [WellnessRuleApi.reducerPath]: WellnessRuleApi.reducer,
            [AiCopilotApi.reducerPath]: AiCopilotApi.reducer,
            [AdminAiCopilotApi.reducerPath]: AdminAiCopilotApi.reducer,
            [AdminAiKnowledgeApi.reducerPath]: AdminAiKnowledgeApi.reducer,
            auth: authReducer,
            app: appReducer,
            modal: modalReducer,
            video: videoReducer,
            videoProcessing: videoProcessingReducer,
            wellness: wellnessReducer
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
                AdminAiStudioApi.middleware,
                AdminScheduledPostsApi.middleware,
                StudioPostScheduleApi.middleware,
                ScreenTimeApi.middleware,
                WellnessRuleApi.middleware,
                AiCopilotApi.middleware,
                AdminAiCopilotApi.middleware,
                AdminAiKnowledgeApi.middleware,
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
