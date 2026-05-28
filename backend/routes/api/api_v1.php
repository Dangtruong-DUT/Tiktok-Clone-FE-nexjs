<?php

use App\Http\Controllers\Api\Admin\AppealAdminController;
use App\Http\Controllers\Api\Admin\CommentAdminController;
use App\Http\Controllers\Api\Admin\PostAdminController;
use App\Http\Controllers\Api\Admin\SystemAdminController;
use App\Http\Controllers\Api\Admin\UserAdminController;
use App\Http\Controllers\Api\AppealController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HashtagController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\UserSettingsController;
use App\Http\Controllers\Api\VideoStreamController;
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
        });

    // video encoding management
    Route::prefix('videos')
        ->name('videos.')
        ->middleware('throttle:60,1')
        ->group(function () {
            Route::get('{upload_file_uuid}/encoding-status', [VideoStreamController::class, 'encodingStatus'])
                ->name('encoding-status');
            Route::post('{upload_file_uuid}/retry-encoding', [VideoStreamController::class, 'retryEncoding'])
                ->middleware('throttle:10,1')
                ->name('retry-encoding');
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

