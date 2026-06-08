<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_copilot_messages', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('session_id')->constrained('ai_copilot_sessions')->cascadeOnDelete();
            $table->enum('role', ['user', 'assistant', 'system']);
            $table->text('content');
            $table->string('intent', 50)->nullable()->index();
            $table->decimal('intent_confidence', 4, 3)->nullable();
            $table->json('attachments')->nullable();
            $table->json('structured_output')->nullable();
            $table->json('follow_up_chips')->nullable();
            $table->json('token_usage')->nullable();
            $table->unsignedInteger('latency_ms')->nullable();
            $table->string('provider', 50)->default('gemini');
            $table->string('model', 100)->nullable();
            $table->foreignId('prompt_template_id')->nullable()->nullOnDelete()->constrained('ai_prompt_templates');
            $table->string('status', 30)->default('success');
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index(['session_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_copilot_messages');
    }
};
