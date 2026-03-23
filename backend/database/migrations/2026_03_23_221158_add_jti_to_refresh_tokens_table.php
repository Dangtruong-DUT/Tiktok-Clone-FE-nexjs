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
        Schema::table('refresh_tokens', function (Blueprint $table) {
            $table->uuid('jti')->after('id')->unique();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('refresh_tokens', function (Blueprint $table) {
            $table->dropColumn('jti');
        });
    }
};
