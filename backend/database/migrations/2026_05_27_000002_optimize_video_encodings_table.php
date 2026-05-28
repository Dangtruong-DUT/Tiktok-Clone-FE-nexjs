<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('video_encodings', function (Blueprint $table) {
            $table->index(['upload_file_id', 'status'], 'video_encodings_file_status_index');
            $table->index(['status', 'updated_at'], 'video_encodings_status_updated_index');
        });
    }

    public function down(): void
    {
        Schema::table('video_encodings', function (Blueprint $table) {
            $table->dropIndex('video_encodings_file_status_index');
            $table->dropIndex('video_encodings_status_updated_index');
        });
    }
};
