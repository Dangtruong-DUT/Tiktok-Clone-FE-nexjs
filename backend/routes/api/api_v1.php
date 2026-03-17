<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

/**
 * public routes
 */

// auth routes
Route::prefix('auth')->controller(AuthController::class)
->name('auth.')
->group(function() {
    Route::post('/login', 'login')->name('login');
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
        Route::post('/refresh-token', [AuthController::class, 'refresh'])->name('refresh');
        Route::get('/me', [AuthController::class, 'me'])->name('me');
    });
});
