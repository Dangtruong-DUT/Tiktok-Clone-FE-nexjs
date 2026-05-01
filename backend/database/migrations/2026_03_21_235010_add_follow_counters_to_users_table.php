<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // add new columns with default value
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('followers_count')->default(0);
            $table->unsignedBigInteger('following_count')->default(0);
        });

        // set negative values to 0 before adding CHECK constraint
        DB::statement('
            UPDATE users SET
                followers_count = GREATEST(followers_count, 0),
                following_count = GREATEST(following_count, 0)
        ');

        // add CHECK constraint to ensure counters are non-negative
        DB::statement('
            ALTER TABLE users
            ADD CONSTRAINT users_follow_counters_non_negative
            CHECK (
                followers_count >= 0 AND
                following_count >= 0
            )
        ');
    }

    public function down(): void
    {
        // drop CHECK constraint
        DB::statement('
            ALTER TABLE users
            DROP CONSTRAINT IF EXISTS users_follow_counters_non_negative
        ');

        // Drop columns
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['followers_count', 'following_count']);
        });
    }
};
