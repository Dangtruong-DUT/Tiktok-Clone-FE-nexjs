<?php
use Illuminate\Support\Facades\Route;

/*|--------------------------------------------------------------------------
| API Version 1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->as('api.v1.')->group(function() {
    require __DIR__.'/api/api_v1.php';
});
