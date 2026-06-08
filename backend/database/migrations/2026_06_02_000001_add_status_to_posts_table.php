<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->string('status', 30)->default('published')->after('audience');
            $table->timestamp('published_at')->nullable()->after('status');
            $table->index('status');
        });

        // Back-fill published_at from created_at for all existing posts
        DB::statement('UPDATE posts SET published_at = created_at WHERE published_at IS NULL');
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropColumn(['status', 'published_at']);
        });
    }
};
