<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('appeal_tokens');

        Schema::table('appeals', function (Blueprint $table) {
            $table->dropForeign(['user_id']);

            $table->unsignedBigInteger('user_id')->nullable(false)->change();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::create('appeal_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('token_hash')->unique();
            $table->string('email');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('appeal_type')->nullable();
            $table->unsignedBigInteger('resource_id')->nullable();
            $table->string('resource_type')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('used_at')->nullable();
            $table->foreignId('appeal_id')->nullable()->constrained('appeals')->nullOnDelete();
            $table->timestamps();

            $table->index('email');
            $table->index('expires_at');
        });
    }
};
