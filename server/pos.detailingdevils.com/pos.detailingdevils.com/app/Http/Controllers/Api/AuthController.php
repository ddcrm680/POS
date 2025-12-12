<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Validator;
use Illuminate\Validation\Rules\Password;


class AuthController extends Controller
{
    /**
     * Token-based login (email or phone + password)
     */
    public function tokenLogin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'       => 'required_without:phone|nullable|email',
            'phone'       => 'required_without:email|nullable|string',
            'password'    => 'required|string|min:8',
            'device_name' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'code'    => 422,
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            // Find user by email or phone
            $user = $request->filled('email')
                ? User::where('email', $request->email)->first()
                : User::where('phone', $request->phone)->first();

            // Invalid credentials
            if (! $user || ! Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'code'    => 404,
                    'message' => 'Invalid credentials',
                    'data'    => null,
                ], 404);
            }

            // Optional: prevent login for inactive users
            if (isset($user->is_active) && ! (bool) $user->is_active) {
                return response()->json([
                    'success' => false,
                    'code'    => 403,
                    'message' => 'Account is inactive. Please contact support.',
                    'data'    => null,
                ], 403);
            }

            // Create token (wrap only what might fail)
            $tokenName  = $request->input('device_name', 'api-device');
            $plainToken = $user->createToken($tokenName)->plainTextToken;

            $user->update([
                'last_login_at' => now(),
                'last_login_ip' => $request->ip(),
            ]);

            // Load role slug only
            $user->load('role:id,slug');
            $userPayload = $user->only([
                'id','name','email','phone','role_id','avatar','is_active',
                'last_login_at','last_login_ip','created_at','updated_at'
            ]);
            $userPayload['role'] = $user->role->slug ?? null;

            return response()->json([
                'success'     => true,
                'code'        => 200,
                'message'     => 'Login successful',
                'token'       => $plainToken,
                'token_type'  => 'Bearer',
                'data'        => $userPayload,
            ], 200);

        } catch (\Throwable $e) {

            return response()->json([
                'success' => false,
                'code'    => 500,
                'message' => 'Something went wrong, please try again later',
            ], 500);
        }
    }

    /**
     * Logout (revoke current token)
     */
    public function tokenLogout(Request $request)
    {
        try {
            $user = $request->user();

            if (! $user) {
                return response()->json([
                    'success' => false,
                    'code'    => 401,
                    'message' => 'Unauthenticated',
                    'data'    => null,
                ], 401);
            }

            if ($user->currentAccessToken()) {
                $user->currentAccessToken()->delete();
            }

            // Audit log
            $user->update(['last_logout_at' => now()]);

            return response()->json([
                'success' => true,
                'code'    => 200,
                'message' => 'Logged out successfully',
            ], 200);

        } catch (\Throwable $e) {

            return response()->json([
                'success' => false,
                'code'    => 500,
                'message' => 'Logout failed',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }



}
