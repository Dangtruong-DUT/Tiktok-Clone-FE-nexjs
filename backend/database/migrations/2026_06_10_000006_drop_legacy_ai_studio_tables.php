<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('scheduled_posts', function ($table) {
            $table->dropForeign(['calendar_item_id']);
        });

        Schema::dropIfExists('ai_content_calendar_items');
        Schema::dropIfExists('ai_content_calendars');
        Schema::dropIfExists('ai_viral_scores');
        Schema::dropIfExists('ai_creator_conversations');
        Schema::dropIfExists('ai_content_suggestions');
    }

    public function down(): void
    {
        // Irreversible — data is gone. No rollback.
    }
};