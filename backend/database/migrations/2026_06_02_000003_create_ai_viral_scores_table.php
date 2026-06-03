<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_viral_scores', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('post_id')->nullable()->nullOnDelete()->constrained();
            $table->foreignId('upload_file_id')->nullable()->nullOnDelete()->constrained();

            // Input
            $table->text('caption')->nullable();
            $table->jsonb('hashtags')->nullable();

            // Analysis
            $table->decimal('overall_score', 5, 2)->nullable();
            $table->string('level', 20)->nullable();
            $table->jsonb('breakdown')->nullable();
            $table->jsonb('strengths')->nullable();
            $table->jsonb('weaknesses')->nullable();
            $table->jsonb('recommendations')->nullable();
            $table->text('improved_caption')->nullable();
            $table->jsonb('suggested_hashtags')->nullable();

            // Metadata
            $table->string('status', 30)->default('pending');
            $table->string('provider', 50)->default('gemini');
            $table->string('model', 100)->nullable();
            $table->string('prompt_version', 20)->default('v1');
            $table->jsonb('token_usage')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('analyzed_at')->nullable();

            $table->softDeletes();
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_viral_scores');
    }
};
