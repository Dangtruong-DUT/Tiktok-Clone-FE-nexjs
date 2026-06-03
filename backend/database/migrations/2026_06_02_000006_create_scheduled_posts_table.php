<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scheduled_posts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();

            $table->timestamp('scheduled_at');
            $table->string('user_timezone', 50)->default('UTC');

            $table->string('status', 30)->default('pending');
            $table->string('source', 30)->default('manual');
            $table->foreignId('calendar_item_id')->nullable()->nullOnDelete()->constrained('ai_content_calendar_items');

            $table->timestamp('published_at')->nullable();
            $table->text('error_message')->nullable();

            $table->softDeletes();
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
            $table->index('scheduled_at');
            $table->index(['status', 'scheduled_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scheduled_posts');
    }
};
