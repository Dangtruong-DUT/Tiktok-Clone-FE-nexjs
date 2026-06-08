<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_content_calendar_items', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('calendar_id')->constrained('ai_content_calendars')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Content idea
            $table->tinyInteger('day_of_week')->default(1);
            $table->text('content_idea');
            $table->string('suggested_format', 100)->nullable();
            $table->jsonb('suggested_hashtags')->nullable();
            $table->text('caption_draft')->nullable();
            $table->text('hook_idea')->nullable();
            $table->decimal('estimated_virality_score', 5, 2)->nullable();

            // Lifecycle — only draft_post_id here; scheduled_posts references this table via calendar_item_id
            $table->string('status', 30)->default('idea');
            $table->foreignId('draft_post_id')->nullable()->nullOnDelete()->constrained('posts');

            $table->softDeletes();
            $table->timestamps();

            $table->index('user_id');
            $table->index('calendar_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_content_calendar_items');
    }
};
