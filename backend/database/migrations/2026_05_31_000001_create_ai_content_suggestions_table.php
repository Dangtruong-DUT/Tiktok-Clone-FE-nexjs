<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_content_suggestions', function (Blueprint $table) {
            // Identity
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('post_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('upload_file_id')->nullable()->constrained()->nullOnDelete();

            // Raw input (stored for debugging & re-generation)
            $table->string('video_title', 300)->nullable();
            $table->text('video_description')->nullable();
            $table->text('video_transcript')->nullable();
            $table->text('ocr_text')->nullable();
            $table->string('creator_language', 10)->default('en');
            $table->string('input_category', 100)->nullable();

            // AI output
            $table->text('short_caption')->nullable();
            $table->text('professional_caption')->nullable();
            $table->text('viral_caption')->nullable();
            $table->jsonb('hashtags')->nullable();
            $table->string('topic', 300)->nullable();
            $table->string('category_suggestion', 100)->nullable();
            $table->string('target_audience', 400)->nullable();
            $table->string('content_intent', 50)->nullable();
            $table->decimal('confidence_score', 4, 3)->nullable();
            $table->text('safety_notes')->nullable();

            // Provider metadata
            $table->string('provider', 50)->default('gemini');
            $table->string('model', 100)->nullable();
            $table->string('prompt_version', 20)->default('v1');

            // Lifecycle
            $table->string('status', 30)->default('pending');
            $table->text('error_message')->nullable();
            $table->char('request_hash', 64)->nullable();
            $table->jsonb('raw_response')->nullable();
            $table->jsonb('token_usage')->nullable();
            $table->timestamp('generated_at')->nullable();
            $table->timestamp('applied_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('user_id');
            $table->index('status');
            $table->index('request_hash');
            $table->index('created_at');
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_content_suggestions');
    }
};
