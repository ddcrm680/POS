<?php

use Illuminate\Support\Facades\Route;

/*
|---------------------------------------------------------------------------
| Web Routes
|---------------------------------------------------------------------------
|
| Keep login/logout here so the web middleware (session + csrf) runs.
| We keep the /api/* paths to avoid changing the frontend.
|
*/

Route::get('/', function () {
    return view('welcome');
});