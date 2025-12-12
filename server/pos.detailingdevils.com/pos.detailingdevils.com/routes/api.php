<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Admin\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes (Token-Based Sanctum)
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'tokenLogin']);
Route::post('/logout', [AuthController::class, 'tokenLogout'])
    ->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->prefix('account')->group(function () {
    Route::get('/', [UserController::class, 'account']);
    Route::post('/update-profile', [UserController::class, 'updateProfile']);
    Route::post('/update-password', [UserController::class, 'updatePassword']);
});


// Admin routes
Route::middleware(['auth:sanctum', 'role:admin,super-admin'])->prefix('admin')->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index']);

});
