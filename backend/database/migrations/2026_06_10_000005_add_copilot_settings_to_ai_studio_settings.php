<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ai_studio_settings', function (Blueprint $table) {
            $table->json('feature_flags')->nullable()->after('async_mode');
            $table->boolean('copilot_enabled')->default(true)->after('feature_flags');
            $table->unsignedSmallInteger('copilot_session_ttl_hours')->default(24)->after('copilot_enabled');
            $table->unsignedSmallInteger('copilot_max_messages_per_session')->default(50)->after('copilot_session_ttl_hours');
        });
    }

    public function down(): void
    {
        Schema::table('ai_studio_settings', function (Blueprint $table) {
            $table->dropColumn(['feature_flags', 'copilot_enabled', 'copilot_session_ttl_hours', 'copilot_max_messages_per_session']);
        });
    }
};
