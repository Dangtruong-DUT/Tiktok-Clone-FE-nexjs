<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_studio_settings', function (Blueprint $table) {
            $table->id();

            // Rate limiting
            $table->integer('daily_limit_per_user')->default(20);
            $table->integer('global_daily_limit')->default(5000);
            $table->integer('rate_limit_per_minute')->default(10);

            // Feature flags
            $table->boolean('is_enabled')->default(true);
            $table->boolean('require_min_input')->default(true);

            // Gemini model settings (admin overrides config without redeploy)
            $table->string('gemini_model', 100)->default('gemini-1.5-flash');
            $table->integer('max_output_tokens')->default(2048);
            $table->decimal('temperature', 3, 2)->default(0.70);
            $table->integer('timeout_seconds')->default(30);

            // Cache & async
            $table->integer('cache_ttl_hours')->default(6);
            $table->boolean('async_mode')->default(true);

            // Audit
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_studio_settings');
    }
};
