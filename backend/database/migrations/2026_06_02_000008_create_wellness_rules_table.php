<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wellness_rules', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('type', 30);
            $table->jsonb('conditions');
            $table->string('action', 30);
            $table->string('title', 200);
            $table->text('message');
            $table->boolean('is_enabled')->default(true);
            $table->text('natural_language_input')->nullable();

            $table->timestamps();

            $table->index('user_id');
            $table->index(['user_id', 'is_enabled']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wellness_rules');
    }
};
