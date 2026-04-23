<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('appeals', function (Blueprint $table) {
            $table->string('appeal_token', 128)->nullable()->unique()->after('uuid');
            $table->timestamp('appeal_token_expires_at')->nullable()->after('appeal_token');
            $table->json('evidence_file_ids')->nullable()->after('reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appeals', function (Blueprint $table) {
            $table->dropColumn(['appeal_token', 'appeal_token_expires_at', 'evidence_file_ids']);
        });
    }
};
