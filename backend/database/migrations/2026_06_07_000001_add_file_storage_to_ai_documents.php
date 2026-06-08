<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ai_documents', function (Blueprint $table) {
            $table->string('file_path')->nullable()->after('source_url');
            $table->string('file_disk')->nullable()->after('file_path');
        });
    }

    public function down(): void
    {
        Schema::table('ai_documents', function (Blueprint $table) {
            $table->dropColumn(['file_path', 'file_disk']);
        });
    }
};
