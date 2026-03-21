<?php
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PostController;

/*|--------------------------------------------------------------------------
| API Version 1
|--------------------------------------------------------------------------
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which is assigned the "api" middleware
| group. Enjoy building your API!
*/

/**
 * public routes
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

/**
 * protected routes
 */
Route::middleware(['auth:api', 'check_user_status'])->group(function () {
    // auth routes
    Route::prefix('auth')
    ->name('auth.')
    ->group(function() {
        Route::post('/logout',[AuthController::class, 'logout'])->name('logout');
        Route::post('/logout/all',[AuthController::class, 'logoutAll'])->name('logout-all');
        Route::get('/me', [AuthController::class, 'me'])->name('me');
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
            Route::post('/follow', [UserController::class, 'follow'])->name('follow');
            Route::delete('/follow/{user_id}', [UserController::class, 'unfollow'])->name('unfollow');
            Route::put('/change-password', [UserController::class, 'changePassword'])->name('change-password');
            Route::patch('/me', [UserController::class, 'update'])->name('update');
        });

    //post routes
    Route::prefix('posts')
        ->name('posts.')
        ->group(function () {
            Route::post('/', [PostController::class, 'create'])->name('create');
        });

});
