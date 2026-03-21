<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Set negative values to 0 before adding CHECK constraint
        DB::statement("
            UPDATE posts SET
                likes_count = GREATEST(likes_count, 0),
                share_count = GREATEST(share_count, 0),
                comments_count = GREATEST(comments_count, 0),
                bookmarks_count = GREATEST(bookmarks_count, 0),
                repost_count = GREATEST(repost_count, 0),
                quote_post_count = GREATEST(quote_post_count, 0),
                guest_views = GREATEST(guest_views, 0),
                user_views = GREATEST(user_views, 0)
        ");

        // Add CHECK constraint
        DB::statement("
            ALTER TABLE posts
            ADD CONSTRAINT posts_counters_non_negative
            CHECK (
                likes_count >= 0 AND
                share_count >= 0 AND
                comments_count >= 0 AND
                bookmarks_count >= 0 AND
                repost_count >= 0 AND
                quote_post_count >= 0 AND
                guest_views >= 0 AND
                user_views >= 0
            )
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE posts
            DROP CONSTRAINT IF EXISTS posts_counters_non_negative
        ");
    }
};
