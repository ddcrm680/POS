<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
     /**
     * Handle an incoming request.
     * Usage in routes: ->middleware('role:admin') or ->middleware('role:admin,editor')
     */
    public function handle(Request $request, Closure $next, $roles)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $allowed = array_map('trim', explode(',', $roles));

        // make sure role relation is loaded to avoid extra queries
        $user->loadMissing('role');

        if (! $user->role || ! in_array($user->role->slug, $allowed, true)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return $next($request);
    }

}
