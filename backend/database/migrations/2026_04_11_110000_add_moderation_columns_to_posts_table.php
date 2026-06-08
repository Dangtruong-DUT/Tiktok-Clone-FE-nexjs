<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations - Add moderation columns to posts table
     * Tracks: when post was hidden, reason for hiding/deletion
     */
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->timestamp('hidden_at')->nullable()->after('deleted_at');
            $table->text('hidden_reason')->nullable()->after('hidden_at');

            // Indexes
            $table->index('hidden_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn(['hidden_at', 'hidden_reason']);
            $table->dropIndex(['hidden_at']);
        });
    }
};
