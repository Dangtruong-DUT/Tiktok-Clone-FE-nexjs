<?php

use App\Enums\UserVerifyStatus;
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
            $table->uuid("uuid")->unique();
            $table->string('name')->index();
            $table->string("username")->unique();
            $table->string('email')->unique();
            $table->string('password');
            $table->text('bio')->nullable();
            $table->string('location')->nullable();
            $table->string("website")->nullable();
            $table->date('date_of_birth')->nullable();
            $table->tinyInteger("verify")
                ->default(UserVerifyStatus::UNVERIFIED->value)
                ->index();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create("refresh_tokens", function(Blueprint $table) {
            $table->id();
            $table->foreignId("user_id")->constrained()->cascadeOnDelete();
            $table->string("token")->unique();
            $table->timestamp("expires_at");
            $table->softDeletes();
        });

        Schema::create("email_verifications", function(Blueprint $table) {
            $table->id();
            $table->foreignId("user_id")->constrained()->cascadeOnDelete();
            $table->string("token")->unique();
            $table->timestamp("expires_at");
            $table->softDeletes();
        });

        Schema::create("password_resets", function(Blueprint $table) {
            $table->id();
            $table->foreignId("user_id")->constrained()->cascadeOnDelete();
            $table->string("token")->unique();
            $table->timestamp("expires_at");
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists("refresh_tokens");
        Schema::dropIfExists("email_verifications");
        Schema::dropIfExists("password_resets");
    }
};