<?php

use App\Http\Controllers\Api\Admin\AppealAdminController;
use App\Http\Controllers\Api\Admin\AiCopilotAdminController;
use App\Http\Controllers\Api\Admin\AiStudioAdminController;
use App\Http\Controllers\Api\Admin\ScheduledPostAdminController;
use App\Http\Controllers\Api\Admin\CommentAdminController;
use App\Http\Controllers\Api\Admin\PostAdminController;
use App\Http\Controllers\Api\Admin\SystemAdminController;
use App\Http\Controllers\Api\Admin\UserAdminController;
use App\Http\Controllers\Api\AppealController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HashtagController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\ScreenTimeController;
use App\Http\Controllers\Api\WellnessRuleController;
use App\Http\Controllers\Api\Admin\AiKnowledgeAdminController;
use App\Http\Controllers\Api\Studio\AiCopilotController;
use App\Http\Controllers\Api\Studio\StudioPostScheduleController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\UserSettingsController;
use App\Http\Controllers\Api\VideoStreamController;
use App\Http\Controllers\Api\VideoUploadSessionController;
use Illuminate\Support\Facades\Route;

/*|--------------------------------------------------------------------------
| Protected routes
|--------------------------------------------------------------------------
| These routes require authentication and user must be active.
| The 'check_user_status' middleware checks if the authenticated user is active.
| If the user is not active, it will return a 403 Forbidden response.
*/

Route::middleware(['auth:api', 'check_user_status'])->group(function () {
    // auth routes
    Route::prefix('auth')
        ->name('auth.')
        ->group(function () {
            Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
            Route::post('/logout/all', [AuthController::class, 'logoutAll'])->name('logout-all');
            Route::get('/me', [AuthController::class, 'me'])->name('me');
            Route::post('/resend-verify-email', [AuthController::class, 'resendVerifyEmail'])
                ->middleware('throttle:3,1')
                ->name('resend-verify-email');
        });

    // media routes
    Route::prefix('medias')
        ->name('media.')
        ->group(function () {
            Route::post('upload-image', [UploadController::class, 'uploadImage'])
                ->middleware('throttle:20,1')
                ->name('upload-image');
            Route::post('upload-video', [UploadController::class, 'uploadVideo'])
                ->middleware('throttle:10,1')
                ->name('upload-video');
        });

    // user routes
    Route::prefix('users')
        ->name('users.')
        ->group(function () {
            Route::post('{user_uuid}/follow', [UserController::class, 'follow'])->name('follow');
            Route::delete('{user_uuid}/follow', [UserController::class, 'unfollow'])->name('unfollow');
            Route::put('/change-password', [UserController::class, 'changePassword'])->name('change-password');
            Route::patch('/me', [UserController::class, 'update'])->name('update');
            Route::get('/me', [UserController::class, 'showMe'])->name('show-me');
            Route::get('/me/indicators', [UserController::class, 'indicators'])->name('indicators');
            Route::get('/suggested', [UserController::class, 'suggested'])->name('suggested');
            Route::get('/me/settings', [UserSettingsController::class, 'show'])->name('show-settings');
            Route::patch('/me/settings', [UserSettingsController::class, 'update'])->name('update-settings');
        });

    // post routes
    Route::prefix('posts')
        ->name('posts.')
        ->group(function () {
            Route::post('/', [PostController::class, 'create'])->name('create');
            Route::patch('{post_uuid}', [PostController::class, 'update'])->name('update');
            Route::delete('{post_uuid}', [PostController::class, 'delete'])->name('delete');
            Route::post('{post_uuid}/like', [PostController::class, 'like'])->name('like');
            Route::delete('{post_uuid}/like', [PostController::class, 'unlike'])->name('unlike');
            Route::post('{post_uuid}/bookmark', [PostController::class, 'bookmark'])->name('bookmark');
            Route::delete('{post_uuid}/bookmark', [PostController::class, 'unbookmark'])->name('unbookmark');
            Route::get('friend', [PostController::class, 'showFriendsPosts'])->name('friends');
            Route::get('following', [PostController::class, 'showFollowingPosts'])->name('following');

            // Studio post management (scheduling & publishing)
            Route::get('mine',                         [StudioPostScheduleController::class, 'posts'])      ->name('mine');
            Route::get('scheduled',                    [StudioPostScheduleController::class, 'index'])      ->name('scheduled.index');
            Route::post('{post_uuid}/schedule',        [StudioPostScheduleController::class, 'schedule'])   ->middleware('throttle:10,1')->name('schedule');
            Route::put('scheduled/{uuid}/reschedule',  [StudioPostScheduleController::class, 'reschedule'])->middleware('throttle:10,1')->name('scheduled.reschedule');
            Route::post('{post_uuid}/publish-now',     [StudioPostScheduleController::class, 'publishNow'])->middleware('throttle:10,1')->name('publish-now');
            Route::post('scheduled/{uuid}/cancel',     [StudioPostScheduleController::class, 'cancel'])     ->middleware('throttle:10,1')->name('scheduled.cancel');
        });

    // notification routes
    Route::prefix('notifications')
        ->name('notifications.')
        ->group(function () {
            Route::get('/', [NotificationController::class, 'index'])->name('index');
            Route::get('/unread-count', [NotificationController::class, 'unreadCount'])->name('unread-count');
            Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
            Route::post('/{notification_uuid}/read', [NotificationController::class, 'markAsRead'])->name('mark-as-read');
        });

    // admin routes
    Route::prefix('admin')
        ->name('admin.')
        ->middleware(['admin'])
        ->group(function () {
            // User management
            Route::get('/users', [UserAdminController::class, 'getUsers'])->name('list-users');
            Route::get('/users/{user_uuid}', [UserAdminController::class, 'getUserDetail'])->name('get-user-detail');
            Route::post('/users/{user_uuid}/ban', [UserAdminController::class, 'banUser'])->name('ban-user');
            Route::delete('/users/{user_uuid}/ban', [UserAdminController::class, 'unbanUser'])->name('unban-user');
            Route::delete('/users/{user_uuid}', [UserAdminController::class, 'deleteUser'])->name('delete-user');
            Route::post('/users/{user_uuid}/restore', [UserAdminController::class, 'restoreUser'])->name('restore-user');
            Route::post('/users/{user_uuid}/reset-password', [UserAdminController::class, 'resetUserPassword'])->name('reset-user-password');
            Route::post('/users/{user_uuid}/send-mail', [UserAdminController::class, 'sendUserMail'])->name('send-user-mail');

            // Post moderation
            Route::get('/posts', [PostAdminController::class, 'getPosts'])->name('list-posts');
            Route::delete('/posts/{post_uuid}', [PostAdminController::class, 'deletePost'])->name('delete-post');

            // Comment moderation
            Route::get('/comments', [CommentAdminController::class, 'getComments'])->name('list-comments');
            Route::delete('/comments/{comment_uuid}', [CommentAdminController::class, 'deleteComment'])->name('delete-comment');

            // Dashboard & Monitoring
            Route::get('/dashboard/stats', [SystemAdminController::class, 'getDashboardStats'])->name('dashboard-stats');
            Route::get('/activity-logs', [SystemAdminController::class, 'getActivityLogs'])->name('activity-logs');

            // Appeal management
            Route::get('/appeals', [AppealAdminController::class, 'index'])->name('list-appeals');
            Route::post('/appeals/{appeal_uuid}/approve', [AppealAdminController::class, 'approve'])->name('approve-appeal');
            Route::post('/appeals/{appeal_uuid}/reject', [AppealAdminController::class, 'reject'])->name('reject-appeal');

            // AI Studio admin (legacy per-tool settings)
            Route::prefix('ai-studio')->name('ai-studio.')->group(function () {
                Route::get('metrics', [AiStudioAdminController::class, 'metrics'])->name('metrics');
                Route::get('settings', [AiStudioAdminController::class, 'settings'])->name('settings');
                Route::put('settings', [AiStudioAdminController::class, 'updateSettings'])->name('settings.update');
                Route::get('requests', [AiStudioAdminController::class, 'requests'])->name('requests');
                Route::get('models', [AiStudioAdminController::class, 'availableModels'])->name('models');

                // AI Copilot admin
                Route::get('copilot/metrics',            [AiCopilotAdminController::class, 'metrics'])->name('copilot.metrics');
                Route::get('copilot/sessions',           [AiCopilotAdminController::class, 'sessions'])->name('copilot.sessions');
                Route::get('prompt-templates',              [AiCopilotAdminController::class, 'listPromptTemplates'])->name('prompt-templates.index');
                Route::put('prompt-templates/{intent}',     [AiCopilotAdminController::class, 'updatePromptTemplate'])->name('prompt-templates.update');
                Route::patch('prompt-templates/{intent}/lock',   [AiCopilotAdminController::class, 'lockTemplate'])->name('prompt-templates.lock');
                Route::patch('prompt-templates/{intent}/unlock', [AiCopilotAdminController::class, 'unlockTemplate'])->name('prompt-templates.unlock');
                Route::post('feature-flags',             [AiCopilotAdminController::class, 'updateFeatureFlags'])->name('feature-flags.update');

                // RAG knowledge base document management
                Route::prefix('knowledge')->name('knowledge.')->group(function () {
                    Route::get('documents',           [AiKnowledgeAdminController::class, 'indexDocuments'])->name('documents.index');
                    Route::post('documents/upload',   [AiKnowledgeAdminController::class, 'uploadDocument'])->name('documents.upload');
                    Route::get('documents/{uuid}',    [AiKnowledgeAdminController::class, 'showDocument'])->name('documents.show');
                    Route::delete('documents/{uuid}', [AiKnowledgeAdminController::class, 'destroyDocument'])->name('documents.destroy');
                });
            });

            // Scheduled posts admin
            Route::prefix('scheduled-posts')->name('scheduled-posts.')->group(function () {
                Route::get('metrics',          [ScheduledPostAdminController::class, 'metrics'])->name('metrics');
                Route::get('requests',         [ScheduledPostAdminController::class, 'requests'])->name('requests');
                Route::post('{uuid}/cancel',   [ScheduledPostAdminController::class, 'forceCancel'])->name('cancel');
                Route::post('{uuid}/retry',    [ScheduledPostAdminController::class, 'forceRetry'])->name('retry');
            });
        });

    // Wellness / Screen Time routes
    Route::prefix('users/me/wellness')
        ->name('wellness.')
        ->group(function () {
            Route::get('stats',   [ScreenTimeController::class, 'stats'])->name('stats');
            Route::get('history', [ScreenTimeController::class, 'history'])->name('history');

            Route::post('sessions/start',               [ScreenTimeController::class, 'startSession'])->middleware('throttle:20,1')->name('sessions.start');
            Route::post('sessions/{uuid}/heartbeat',    [ScreenTimeController::class, 'heartbeat'])->middleware('throttle:120,1')->name('sessions.heartbeat');
            Route::post('sessions/{uuid}/video-time',   [ScreenTimeController::class, 'updateVideoTime'])->middleware('throttle:60,1')->name('sessions.video-time');
            Route::post('sessions/{uuid}/end',          [ScreenTimeController::class, 'endSession'])->middleware('throttle:20,1')->name('sessions.end');

            Route::get('rules',                         [WellnessRuleController::class, 'index'])->name('rules.index');
            Route::post('rules',                        [WellnessRuleController::class, 'store'])->middleware('throttle:10,1')->name('rules.store');
            Route::put('rules/{uuid}',                  [WellnessRuleController::class, 'update'])->name('rules.update');
            Route::delete('rules/{uuid}',               [WellnessRuleController::class, 'destroy'])->name('rules.destroy');
            Route::post('analyze',                      [WellnessRuleController::class, 'analyze'])->middleware('throttle:3,1')->name('analyze');
        });

    // AI Copilot — unified conversational assistant
    Route::prefix('studio/ai')
        ->name('studio.ai.')
        ->group(function () {
            Route::post('copilot/sessions', [AiCopilotController::class, 'startSession'])
                ->middleware('throttle:30,1')
                ->name('copilot.sessions.start');
            Route::get('copilot/sessions/{uuid}', [AiCopilotController::class, 'showSession'])
                ->name('copilot.sessions.show');
            Route::post('copilot/sessions/{uuid}/messages', [AiCopilotController::class, 'sendMessage'])
                ->middleware('throttle:30,1')
                ->name('copilot.sessions.messages.send');
            Route::post('copilot/messages/{uuid}/accept', [AiCopilotController::class, 'accept'])
                ->name('copilot.messages.accept');
            Route::post('copilot/messages/{uuid}/reject', [AiCopilotController::class, 'reject'])
                ->name('copilot.messages.reject');
            Route::delete('copilot/sessions/{uuid}', [AiCopilotController::class, 'destroySession'])
                ->name('copilot.sessions.destroy');
        });

    // video encoding management (legacy — kept for backward compat)
    Route::prefix('videos')
        ->name('videos.')
        ->middleware('throttle:60,1')
        ->group(function () {
            Route::get('{upload_file_uuid}/encoding-status', [VideoStreamController::class, 'encodingStatus'])
                ->name('encoding-status');
            Route::post('{upload_file_uuid}/retry-encoding', [VideoStreamController::class, 'retryEncoding'])
                ->middleware('throttle:10,1')
                ->name('retry-encoding');
            Route::delete('{upload_file_uuid}', [VideoStreamController::class, 'destroy'])
                ->middleware('throttle:10,1')
                ->name('destroy');
        });

    // video upload sessions (direct-to-S3 flow)
    Route::prefix('videos/upload-sessions')
        ->name('video-upload-sessions.')
        ->group(function () {
            Route::post('/', [VideoUploadSessionController::class, 'init'])
                ->middleware('throttle:10,1')
                ->name('init');

            Route::get('{session:uuid}/parts/{partNumber}', [VideoUploadSessionController::class, 'getPartUrl'])
                ->middleware('throttle:200,1')
                ->name('part-url')
                ->whereNumber('partNumber');

            Route::put('{session:uuid}/complete', [VideoUploadSessionController::class, 'complete'])
                ->middleware('throttle:20,1')
                ->name('complete');

            Route::get('{session:uuid}/status', [VideoUploadSessionController::class, 'status'])
                ->middleware('throttle:120,1')
                ->name('status');

            Route::delete('{session:uuid}', [VideoUploadSessionController::class, 'abort'])
                ->middleware('throttle:20,1')
                ->name('abort');
        });
});

/*|--------------------------------------------------------------------------
| Appeal routes — Auth required, banned users CAN access
|--------------------------------------------------------------------------
| These routes require authentication but bypass check_user_status,
| allowing banned users to create and manage their appeals.
*/

Route::middleware(['auth:api'])
    ->prefix('appeals')
    ->name('appeals.')
    ->group(function () {
        Route::get('/resource-preview', [AppealController::class, 'resourcePreview'])->name('resource-preview');
        Route::get('/', [AppealController::class, 'index'])->name('list');
        Route::post('/', [AppealController::class, 'create'])->name('create');
        Route::put('/{appeal_uuid}', [AppealController::class, 'update'])->name('update');
        Route::get('/{appeal_uuid}', [AppealController::class, 'show'])->name('show');
    });

/*|--------------------------------------------------------------------------
| AI Copilot SSE stream — token-authenticated, no Bearer header needed
|--------------------------------------------------------------------------
| EventSource cannot send Authorization headers, so this endpoint lives
| outside auth:api and authenticates via the encrypted short-lived token.
*/

Route::get('studio/ai/copilot/sessions/{uuid}/stream/{message_uuid}', [AiCopilotController::class, 'stream'])
    ->middleware('throttle:60,1')
    ->name('studio.ai.copilot.stream');

/*|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
| These routes are accessible without authentication.
*/

// auth routes
Route::prefix('auth')
    ->name('auth.')
    ->group(function () {
        Route::post('/login', [AuthController::class, 'login'])
            ->middleware('throttle:5,1')
            ->name('login');
        Route::post('/refresh-token', [AuthController::class, 'refresh'])
            ->middleware('throttle:10,1')
            ->name('refresh');
        Route::post('/register', [AuthController::class, 'register'])
            ->middleware('throttle:3,1')
            ->name('register');
        Route::post('forgot-password', [AuthController::class, 'forgotPassword'])
            ->middleware('throttle:3,1')
            ->name('forgot-password');
        Route::post('verify-forgot-password', [AuthController::class, 'verifyForgotPasswordToken'])
            ->middleware('throttle:5,1')
            ->name('verify-forgot-password');
        Route::post('/reset-password', [AuthController::class, 'resetPassword'])
            ->middleware('throttle:5,1')
            ->name('reset-password');
        Route::post('/verify-email', [AuthController::class, 'verifyEmail'])
            ->middleware('throttle:5,1')
            ->name('verify-email');
    });

// post routes
Route::prefix('posts')
    ->name('posts.')
    ->group(function () {
        Route::get('{post_uuid}/children', [PostController::class, 'showChildren'])->name('show-children');
        Route::get('{post_uuid}/related', [PostController::class, 'showRelatedPosts'])->name('related');
        Route::get('{post_uuid}', [PostController::class, 'show'])->name('show');
        Route::get('/', [PostController::class, 'index'])->name('index');
    });

// user routes
Route::prefix('users')
    ->name('users.')
    ->group(function () {
        Route::get('{user_uuid}/posts', [PostController::class, 'showUserPosts'])->name('show-posts');
        Route::get('{user_uuid}/like', [PostController::class, 'showLikedPosts'])->name('show-likes');
        Route::get('{user_uuid}/bookmark', [PostController::class, 'showBookmarkedPosts'])->name('show-bookmarks');
        Route::get('{user_uuid}/followers', [UserController::class, 'followers'])->name('followers');
        Route::get('{user_uuid}/following', [UserController::class, 'following'])->name('following');
        Route::get('{user_uuid}/friends', [UserController::class, 'friends'])->name('friends');

        Route::get('/{username}', [UserController::class, 'showProfile'])->name('show-profile');
    });

Route::prefix('search')
    ->name('search.')
    ->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users');
        Route::get('/posts', [PostController::class, 'index'])->name('posts');
        Route::get('/hashtags', [HashtagController::class, 'index'])->name('hashtags');
    });