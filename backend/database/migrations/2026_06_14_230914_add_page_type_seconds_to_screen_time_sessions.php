<?php

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
        Schema::table('screen_time_sessions', function (Blueprint $table) {
            $table->unsignedInteger('comment_seconds')->default(0)->after('video_seconds');
            $table->unsignedInteger('post_seconds')->default(0)->after('comment_seconds');
            $table->unsignedInteger('likes_seconds')->default(0)->after('post_seconds');
        });
    }

    public function down(): void
    {
        Schema::table('screen_time_sessions', function (Blueprint $table) {
            $table->dropColumn(['comment_seconds', 'post_seconds', 'likes_seconds']);
        });
    }
};
