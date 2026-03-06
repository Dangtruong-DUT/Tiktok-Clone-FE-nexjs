<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which is assigned the "api" middleware
| group. Enjoy building your API!
*/

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
    Route::prefix('auth')->controller(AuthController::class)
    ->name('auth.')
    ->group(function() {
        Route::post('/logout', 'logout')->name('logout');
        Route::post('/refresh', 'refresh')->name('refresh');
        Route::get('/me', 'me')->name('me');
    });
});
