<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ai_prompt_templates', function (Blueprint $table) {
            $table->string('category', 32)->default('generative')->after('intent');
        });

        // Back-fill existing templates with correct categories
        $categories = [
            'context'   => ['platform_context_creator', 'platform_context_admin'],
            'routing'   => ['gateway_planner', 'navigation_answer_builder'],
            'data'      => ['analytics_planner', 'analytics_answer_builder'],
            'analysis'  => ['analyze_video', 'analyze_viral', 'analyze_retention', 'analyze_hook', 'analyze_cta', 'analyze_audience', 'analyze_frame', 'analyze_video_segment'],
            'fallback'  => ['general_advice', 'clarification'],
        ];

        foreach ($categories as $category => $intents) {
            DB::table('ai_prompt_templates')
                ->whereIn('intent', $intents)
                ->update(['category' => $category]);
        }
    }

    public function down(): void
    {
        Schema::table('ai_prompt_templates', function (Blueprint $table) {
            $table->dropColumn('category');
        });
    }
};
