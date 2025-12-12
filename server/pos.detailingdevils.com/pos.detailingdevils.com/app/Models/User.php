<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;


class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role_id',
        'is_active',
        'avatar',
        'meta',
        'device_tokens',
        'email_verified_at',
        'last_login_at',
        'last_logout_at',
        'last_login_ip',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'deleted_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
     protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at'     => 'datetime',
        'last_logout_at'    => 'datetime',
        'meta'              => 'array',
        'device_tokens'     => 'array',
    ];

      public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

      public function hasRole(string $slug)
    {
        return $this->role && $this->role->slug === $slug;
    }


}
