<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('video_upload_sessions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('file_name');
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('file_size');

            $table->string('disk', 50)->default('s3');
            $table->string('storage_key', 500)->nullable()->unique();
            $table->string('upload_id', 500)->nullable();
            $table->enum('upload_type', ['single', 'multipart'])->default('single');

            $table->unsignedTinyInteger('status')->default(0);
            $table->json('metadata')->nullable();

            $table->foreignId('upload_file_id')->nullable()->constrained('upload_files')->nullOnDelete();
            $table->foreignId('video_encoding_id')->nullable()->constrained('video_encodings')->nullOnDelete();

            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'updated_at']);
            $table->index('video_encoding_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('video_upload_sessions');
    }
};
