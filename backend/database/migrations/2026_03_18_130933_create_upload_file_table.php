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
        Schema::create('upload_files', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string("file_name")->comment("Original file name");
            $table->string("mime_type");
            $table->string("file_path")->unique();
            $table->string('disk')->default('s3');
            $table->unsignedBigInteger("file_size");
            $table->timestamp("expired_at")->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('upload_files');
    }
};
