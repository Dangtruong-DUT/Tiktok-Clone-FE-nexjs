<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations - Add admin-related columns to users table
     * Tracks: when user was banned, reason for ban
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('banned_at')
                    ->nullable()
                    ->after('verify')
                    ->comment('When the user was banned, NULL if not banned');
            $table->text('ban_reason')
                    ->nullable()
                    ->after('banned_at')
                    ->comment('Reason for banning the user');
            $table->integer('ban_duration_days')
                    ->nullable()
                    ->after('ban_reason')
                    ->comment('Duration of the ban in days, NULL = permanent');

            $table->index('banned_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['banned_at', 'ban_reason', 'ban_duration_days']);
            $table->dropIndex(['banned_at']);
        });
    }
};
