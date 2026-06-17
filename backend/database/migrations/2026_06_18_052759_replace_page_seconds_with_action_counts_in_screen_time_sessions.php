<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('screen_time_sessions', function (Blueprint $table) {
            $table->dropColumn(['comment_seconds', 'post_seconds', 'likes_seconds']);
            $table->unsignedInteger('comments_count')->default(0)->after('video_seconds');
            $table->unsignedInteger('likes_count')->default(0)->after('comments_count');
            $table->unsignedInteger('posts_count')->default(0)->after('likes_count');
        });
    }

    public function down(): void
    {
        Schema::table('screen_time_sessions', function (Blueprint $table) {
            $table->dropColumn(['comments_count', 'likes_count', 'posts_count']);
            $table->unsignedInteger('comment_seconds')->default(0)->after('video_seconds');
            $table->unsignedInteger('post_seconds')->default(0)->after('comment_seconds');
            $table->unsignedInteger('likes_seconds')->default(0)->after('post_seconds');
        });
    }
};
