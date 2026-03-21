<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        /**
         * Add a generated column search_vector to posts table for full-text search on content column.
         */
        DB::statement("
            ALTER TABLE posts
            ADD COLUMN search_vector tsvector
            GENERATED ALWAYS AS (
                to_tsvector('simple',
                    coalesce(content,'')
                )
            ) STORED
        ");

        // Create GIN index for fast search
        DB::statement("
            CREATE INDEX IF NOT EXISTS posts_search_vector_idx
            ON posts USING GIN (search_vector)
        ");
    }

    public function down(): void
    {
        DB::statement("
            DROP INDEX IF EXISTS posts_search_vector_idx
        ");

        DB::statement("
            ALTER TABLE posts
            DROP COLUMN IF EXISTS search_vector
        ");
    }
};
