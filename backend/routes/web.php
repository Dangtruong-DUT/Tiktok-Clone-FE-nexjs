<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/docs/swagger', function () {
    return view('swagger-ui');
})->name('swagger.ui');

Route::get('/docs/swagger.yaml', function () {
    $path = base_path('docs/api/swagger.yaml');
    abort_unless(file_exists($path), 404, 'Swagger spec not found');

    return response()->file($path, [
        'Content-Type' => 'application/yaml; charset=UTF-8',
    ]);
})->name('swagger.spec');
