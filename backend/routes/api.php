<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;

/*|--------------------------------------------------------------------------
| API Version 1
|--------------------------------------------------------------------------
*/

Broadcast::routes([
    'middleware' => ['auth:api', 'check_user_status'],
]);

Route::prefix('v1')->as('api.v1.')->group(function() {
    require __DIR__.'/api/api_v1.php';
});
