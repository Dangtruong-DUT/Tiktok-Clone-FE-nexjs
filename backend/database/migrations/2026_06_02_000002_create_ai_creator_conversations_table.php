<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_creator_conversations', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('status', 30)->default('waiting_for_answer');
            $table->string('current_step', 30)->default('topic');
            $table->jsonb('answers')->default('{}');
            $table->text('last_ai_message')->nullable();
            $table->jsonb('options')->nullable();
            $table->jsonb('generated_result')->nullable();

            $table->string('provider', 50)->default('gemini');
            $table->string('model', 100)->nullable();
            $table->string('prompt_version', 20)->default('v1');
            $table->jsonb('token_usage')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('completed_at')->nullable();

            $table->softDeletes();
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_creator_conversations');
    }
};
