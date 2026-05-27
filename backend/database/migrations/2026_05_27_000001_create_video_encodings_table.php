<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('video_encodings', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('upload_file_id')->constrained('upload_files')->cascadeOnDelete();
            $table->tinyInteger('status')->default(0)->comment('0=pending,1=processing,2=ready,3=failed');
            $table->string('master_playlist_path')->nullable();
            $table->float('duration')->nullable()->comment('Duration in seconds');
            $table->tinyInteger('encoding_progress')->default(0)->comment('0-100');
            $table->text('error_message')->nullable();
            $table->json('resolutions')->nullable()->comment('Encoded resolution labels, e.g. ["360p","720p"]');
            $table->json('metadata')->nullable()->comment('Original dimensions, bitrate, thumbnail path, etc.');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('video_encodings');
    }
};
