<?php
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\HashtagController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\UserSettingsController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AppealController;

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
    ->group(function() {
        Route::post('/logout',[AuthController::class, 'logout'])->name('logout');
        Route::post('/logout/all',[AuthController::class, 'logoutAll'])->name('logout-all');
        Route::get('/me', [AuthController::class, 'me'])->name('me');
        Route::post('/resend-verify-email', [AuthController::class, 'resendVerifyEmail'])->name('resend-verify-email');
    });

    // media routes
    Route::prefix('medias')
        ->name('media.')
        ->group(function () {
            Route::post('upload-image', [UploadController::class, 'uploadImage'])->name('upload-image');
            Route::post('upload-video', [UploadController::class, 'uploadVideo'])->name('upload-video');
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

    //post routes
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

    // conversation routes
    Route::prefix('conversations')
        ->name('conversations.')
        ->group(function () {
            Route::get('/', [ChatController::class, 'index'])->name('index');
            Route::post('/private', [ChatController::class, 'createPrivate'])->name('create-private');
            Route::get('/unread-count', [ChatController::class, 'unreadCount'])->name('unread-count');
            Route::get('/{conversation_id}/messages', [ChatController::class, 'messages'])->name('messages');
            Route::post('/{conversation_id}/messages', [ChatController::class, 'sendMessage'])->name('send-message');
            Route::post('/{conversation_id}/read', [ChatController::class, 'markAsRead'])->name('mark-as-read');
        });

    // appeal routes
    Route::prefix('appeals')
        ->name('appeals.')
        ->group(function () {
            Route::post('/', [AppealController::class, 'create'])->name('create');
            Route::get('/', [AppealController::class, 'index'])->name('list');
        });

    // admin routes (require super_admin role)
    Route::prefix('admin')
        ->name('admin.')
        ->middleware(['admin'])
        ->group(function () {
            // User management
            Route::get('/users', [AdminController::class, 'getUsers'])->name('list-users');
            Route::post('/users/{user_id}/ban', [AdminController::class, 'banUser'])->name('ban-user');
            Route::post('/users/{user_id}/unban', [AdminController::class, 'unbanUser'])->name('unban-user');
            Route::delete('/users/{user_id}', [AdminController::class, 'deleteUser'])->name('delete-user');
            Route::post('/users/{user_id}/delete', [AdminController::class, 'deleteUser'])->name('delete-user-post');

            // Post moderation
            Route::get('/posts', [AdminController::class, 'getPosts'])->name('list-posts');
            Route::post('/posts/{post_uuid}/hide', [AdminController::class, 'hidePost'])->name('hide-post');
            Route::post('/posts/{post_uuid}/unhide', [AdminController::class, 'unhidePost'])->name('unhide-post');
            Route::delete('/posts/{post_uuid}', [AdminController::class, 'deletePost'])->name('delete-post');
            Route::post('/posts/{post_uuid}/delete', [AdminController::class, 'deletePost'])->name('delete-post-compat');

            // Comment moderation
            Route::get('/comments', [AdminController::class, 'getComments'])->name('list-comments');
            Route::delete('/comments/{comment_id}', [AdminController::class, 'deleteComment'])->name('delete-comment');
            Route::post('/comments/{comment_id}/delete', [AdminController::class, 'deleteComment'])->name('delete-comment-post');

            // Dashboard & Monitoring
            Route::get('/dashboard/stats', [AdminController::class, 'getDashboardStats'])->name('dashboard-stats');
            Route::get('/activity-logs', [AdminController::class, 'getActivityLogs'])->name('activity-logs');

            // Appeal management
            Route::get('/appeals', [AdminController::class, 'getAppeals'])->name('list-appeals');
            Route::post('/appeals/{appeal_id}/approve', [AdminController::class, 'approveAppeal'])->name('approve-appeal');
            Route::post('/appeals/{appeal_id}/reject', [AdminController::class, 'rejectAppeal'])->name('reject-appeal');
        });
});


/*|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
| These routes are accessible without authentication.
*/

// auth routes
Route::prefix('auth')
->name('auth.')
->group(function() {
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/refresh-token', [AuthController::class, 'refresh'])->name('refresh');
    Route::post('/register', [AuthController::class, 'register'])->name('register');
    Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->name('forgot-password');
    Route::post('verify-forgot-password', [AuthController::class, 'verifyForgotPasswordToken'])->name('verify-forgot-password');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('reset-password');
    Route::post('/verify-email', [AuthController::class, 'verifyEmail'])->name('verify-email');
});

// post routes
Route::prefix('posts')
    ->name('posts.')
    ->group(function () {
        Route::get('{post_uuid}/children', [PostController::class, 'showChildren'])->name('show');
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

Route::prefix("search")
    ->name("search.")
    ->group(function() {
        Route::get('/users', [UserController::class, 'index'])->name('users');
        Route::get('/posts', [PostController::class, 'index'])->name('posts');
        Route::get('/hashtags', [HashtagController::class, 'index'])->name('hashtags');
    });
