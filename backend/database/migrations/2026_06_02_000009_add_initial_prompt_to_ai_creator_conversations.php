<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ai_creator_conversations', function (Blueprint $table) {
            $table->text('initial_prompt')->nullable()->after('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('ai_creator_conversations', function (Blueprint $table) {
            $table->dropColumn('initial_prompt');
        });
    }
};
