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
        Schema::table('posts_mentions', function (Blueprint $table) {
            $table->unsignedInteger('start')->nullable()->after('user_id');
            $table->unsignedInteger('end')->nullable()->after('start');
        });

        Schema::table('posts_hashtags', function (Blueprint $table) {
            $table->unsignedInteger('start')->nullable()->after('hashtag_id');
            $table->unsignedInteger('end')->nullable()->after('start');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posts_mentions', function (Blueprint $table) {
            $table->dropColumn(['start', 'end']);
        });

        Schema::table('posts_hashtags', function (Blueprint $table) {
            $table->dropColumn(['start', 'end']);
        });
    }
};
