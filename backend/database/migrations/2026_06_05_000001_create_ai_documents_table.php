<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('CREATE EXTENSION IF NOT EXISTS vector;');

        Schema::create('ai_documents', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->string('title');
            $table->string('source_type');          // 'faq', 'guide', 'policy', 'feature'
            $table->string('source_url')->nullable();
            $table->longText('raw_content');
            $table->string('content_type')->default('markdown'); // 'html', 'markdown', 'text'
            $table->integer('chunk_count')->default(0);
            $table->string('language')->default('vi');
            $table->boolean('is_indexed')->default(false);
            $table->timestamp('indexed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_documents');
    }
};
