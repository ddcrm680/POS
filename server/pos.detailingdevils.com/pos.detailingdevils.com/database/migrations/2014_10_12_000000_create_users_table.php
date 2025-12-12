<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        
         Schema::create('users', function (Blueprint $table) {
            $table->id();

            $table->string('name')->nullable();

            // allow either email or phone login
            $table->string('email')->unique()->nullable();
            $table->string('phone')->unique()->nullable();

            // password nullable for social login / OTP login
            $table->string('password')->nullable();
            $table->unsignedBigInteger('role_id')->default(3);

            $table->boolean('is_active')->default(true);

            $table->string('avatar')->nullable();

            // verification & login info
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->timestamp('last_logout_at')->nullable();
            $table->string('last_login_ip', 45)->nullable(); // IPv4/IPv6 safe

            // optional metadata for preferences, social accounts, client info
            $table->json('meta')->nullable();

            // optional: store browser/mobile tokens here 
            $table->json('device_tokens')->nullable();

            $table->rememberToken();
            $table->softDeletes();
            $table->timestamps();

            //indexes
            $table->index('role_id'); 
            $table->index('is_active');
            $table->index('last_login_at');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
