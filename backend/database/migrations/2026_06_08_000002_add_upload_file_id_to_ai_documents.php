<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ai_documents', function (Blueprint $table) {
            $table->foreignId('upload_file_id')
                ->nullable()
                ->after('file_disk')
                ->constrained('upload_files')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('ai_documents', function (Blueprint $table) {
            $table->dropForeign(['upload_file_id']);
            $table->dropColumn('upload_file_id');
        });
    }
};
