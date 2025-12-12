<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Str;
use Validator;
use Intervention\Image\Facades\Image;
use DB;

class UserController extends Controller
{
        /**
     * Return the authenticated user
     */
    public function account(Request $request)
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

            $user->refresh()->load('role:id,slug');

            $userPayload = $user->only([
                'id','name','email','phone','role_id','avatar','is_active',
                'last_login_at','last_login_ip','last_logout_at','created_at','updated_at'
            ]);

            $userPayload['role'] = $user->role->slug ?? null;

            return response()->json([
                'success' => true,
                'code'    => 200,
                'message' => 'User fetched successfully',
                'data'    => $userPayload,
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'code'    => 500,
                'message' => 'Unable to fetch user info',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

     /**
     * POST /account/update-profle
     */

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'code'    => 401,
                'message' => 'Unauthenticated',
                'data'    => null,
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'name'  => 'sometimes|required|string|max:50',
            'phone' => ['sometimes', 'nullable', 'digits:10', 'numeric', Rule::unique('users')->ignore($user->id) ],
            'avatar' => 'sometimes|nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'code'    => 422,
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

    DB::beginTransaction();
    try {

        $formData = $request->only(['name','phone']);
          // Ensure public avatars directory exists
        $publicDir = public_path('avatars');
        if (! is_dir($publicDir)) {
            mkdir($publicDir, 0755, true);
        }

        if ($request->hasFile('avatar')) {
            $image = $request->file('avatar');
            $newImage = Image::make($image)->fit(300, 300, function ($constraint) {
                    $constraint->upsize();
                });

            $imageName = uniqid() . "." . $image->extension();
            $newImage->save(public_path('/avatars/') . $imageName, 80);
            $formData['avatar'] = 'avatars/' . $imageName;

            // delete old  avatar 
           if (! empty($user->avatar) && file_exists(public_path($user->avatar))) {
                @unlink(public_path($user->avatar));
            }  
        }

        $user->update($formData);

        return response()->json([
            'success' => true,
            'code'    => 200,
            'message' => 'Profile updated successfully',
            'data'    => [
                'id'          => $user->id,
                'name'        => $user->name,
                'email'       => $user->email, 
                'phone'       => $user->phone,
                'avatar'      => $user->avatar,
                'avatar_url'  => $user->avatar ? asset($user->avatar) : null,
            ],
        ], 200);

    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'code'    => 500,
            'message' => 'Unable to update profile',
            'error'   => $e->getMessage(),
        ], 500);
    }
}

    /**
     * POST /account/update-password
     */
    public function updatePassword(Request $request)
    {
       
            $user = $request->user();

            if (! $user) {
                return response()->json([
                    'success' => false,
                    'code'    => 401,
                    'message' => 'Unauthenticated',
                    'data'    => null,
                ], 401);
            }

            $validator = Validator::make($request->all(), [
                'current_password' => 'required|string',
                'password' => [
                    'required',
                    'string',
                    'confirmed', 
                    Password::min(8)->mixedCase()->numbers()->symbols(),
                ],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'code'    => 422,
                    'message' => 'Validation failed',
                    'errors'  => $validator->errors(),
                ], 422);
            }

        DB::beginTransaction();
        try {   

            if (! Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'code'    => 403,
                    'message' => 'Current password is incorrect',
                    'data'    => null,
                ], 403);
            }

            $user->update([
                    'password' => Hash::make($request->password)
                ]);

           DB::commit(); 

            return response()->json([
                'success' => true,
                'code'    => 200,
                'message' => 'Password updated successfully',
            ], 200);

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'code'    => 500,
                'message' => 'Unable to update password',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }



}
