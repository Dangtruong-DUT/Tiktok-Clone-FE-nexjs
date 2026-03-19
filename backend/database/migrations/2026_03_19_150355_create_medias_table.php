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
        Schema::create('medias', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->smallInteger('type');
            $table->integer('order')->default(0);
            $table->foreignId('post_id')
                ->constrained("posts")
                ->cascadeOnDelete();
            $table->foreignId('upload_file_id')
                ->constrained("upload_files")
                ->cascadeOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medias');
    }
};