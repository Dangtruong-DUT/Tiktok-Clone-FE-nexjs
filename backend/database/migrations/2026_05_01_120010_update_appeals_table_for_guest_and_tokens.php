<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appeals', function (Blueprint $table) {
            $table->string('email')->nullable()->after('user_id');
            $table->foreignId('user_id')->nullable()->change();
            $table->dropColumn(['appeal_token', 'appeal_token_expires_at']);
        });
    }

    public function down(): void
    {
        Schema::table('appeals', function (Blueprint $table) {
            $table->string('appeal_token', 128)->nullable()->unique()->after('uuid');
            $table->timestamp('appeal_token_expires_at')->nullable()->after('appeal_token');
            $table->dropColumn(['email']);
            $table->foreignId('user_id')->nullable(false)->change();
        });
    }
};
