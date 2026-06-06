<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_document_chunks', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->foreignId('ai_document_id')->constrained()->cascadeOnDelete();
            $table->integer('chunk_index');
            $table->text('content');
            $table->integer('token_count')->default(0);
            $table->boolean('is_embedded')->default(false);
            $table->timestamps();
        });

        // text-embedding-004 produces 768-dimensional vectors by default
        DB::statement('ALTER TABLE ai_document_chunks ADD COLUMN embedding vector(768)');

        // IVFFlat index for approximate nearest-neighbour cosine search
        DB::statement(
            'CREATE INDEX ai_chunk_embedding_idx ON ai_document_chunks '
            . 'USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)'
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_document_chunks');
    }
};
