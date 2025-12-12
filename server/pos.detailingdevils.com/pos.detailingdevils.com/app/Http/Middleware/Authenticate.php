<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
   protected function redirectTo(Request $request): ?string
    {
        // For API or JSON requests — DO NOT redirect, let Handler return JSON 401
        if ($request->expectsJson() || $request->is('api/*')) {
            return null;
        }

        // For normal web requests — redirect ONLY if a login route exists
        return Route::has('login') ? route('login') : null;
    }
}
