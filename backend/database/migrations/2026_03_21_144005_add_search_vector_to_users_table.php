<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        /**
         * Add a generated column search_vector to users table for full-text search on name, username, email, and bio columns.
         */
        DB::statement("
            ALTER TABLE users
            ADD COLUMN search_vector tsvector
            GENERATED ALWAYS AS (
                to_tsvector('simple',
                    coalesce(name,'') || ' ' ||
                    coalesce(username,'') || ' ' ||
                    coalesce(email,'') || ' ' ||
                    coalesce(bio,'')
                )
            ) STORED
        ");

        /* Create a GIN index on the search_vector column for efficient full-text search */
        DB::statement('
            CREATE INDEX users_search_vector_idx
            ON users USING GIN (search_vector)
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('
            DROP INDEX IF EXISTS users_search_vector_idx
        ');

        DB::statement('
            ALTER TABLE users
            DROP COLUMN IF EXISTS search_vector
        ');
    }
};
