<?php

use App\Enums\Post\AudienceTypeEnum;
use App\Enums\Post\PostTypeEnum;
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
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text("content")->nullable();
            $table->smallInteger("type")->default(PostTypeEnum::POST->value);
            $table->smallInteger("audience")->default(AudienceTypeEnum::PRIVATE->value);
            $table->foreignId('parent_id')->nullable()->constrained('posts')->nullOnDelete();
            $table->unsignedBigInteger('likes_count')->default(0);
            $table->unsignedBigInteger('share_count')->default(0);
            $table->unsignedBigInteger('comments_count')->default(0);
            $table->unsignedBigInteger('bookmarks_count')->default(0);
            $table->unsignedBigInteger('repost_count')->default(0);
            $table->unsignedBigInteger('quote_post_count')->default(0);
            $table->unsignedBigInteger('guest_views')->default(0);
            $table->unsignedBigInteger('user_views')->default(0);
            $table->foreignId('thumbnail_file_id')->nullable()->constrained('upload_files')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
