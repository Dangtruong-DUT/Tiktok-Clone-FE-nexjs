<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

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
    Route::post('/register', [AuthController::class, 'register'])->name('register');
    Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->name('forgot-password');
    Route::post('verify-forgot-password', [AuthController::class, 'verifyForgotPasswordToken'])->name('verify-forgot-password');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('reset-password');
    Route::post('/verify-email', [AuthController::class, 'verifyEmail'])->name('verify-email');
});

/**
 * protected routes
 */
Route::middleware('auth:api')->group(function () {
    // auth routes
    Route::prefix('auth')
    ->name('auth.')
    ->group(function() {
        Route::post('/logout',[AuthController::class, 'logout'])->name('logout');
        Route::post('/logout-all',[AuthController::class, 'logoutAll'])->name('logout-all');
        Route::post('/refresh-token', [AuthController::class, 'refresh'])->name('refresh');
        Route::get('/me', [AuthController::class, 'me'])->name('me');
    });
});
