<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_content_calendars', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Input
            $table->string('niche', 200)->nullable();
            $table->string('content_style', 100)->nullable();
            $table->string('posting_frequency', 50)->nullable();
            $table->jsonb('primary_goals')->nullable();
            $table->text('target_audience')->nullable();
            $table->string('creator_language', 10)->default('vi');

            // Generated output
            $table->jsonb('weekly_themes')->nullable();
            $table->text('strategy_notes')->nullable();

            // Metadata
            $table->string('status', 30)->default('pending');
            $table->string('provider', 50)->default('gemini');
            $table->string('model', 100)->nullable();
            $table->string('prompt_version', 20)->default('v1');
            $table->jsonb('token_usage')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('generated_at')->nullable();

            $table->softDeletes();
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_content_calendars');
    }
};
