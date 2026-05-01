<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appeal_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            $table->string('token', 128)->unique();
            $table->string('appeal_type')->nullable();
            $table->unsignedBigInteger('resource_id')->nullable();
            $table->string('resource_type')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('used_at')->nullable();
            $table->foreignId('appeal_id')->nullable()->constrained('appeals')->onDelete('set null');
            $table->timestamps();

            $table->index('email');
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appeal_tokens');
    }
};
