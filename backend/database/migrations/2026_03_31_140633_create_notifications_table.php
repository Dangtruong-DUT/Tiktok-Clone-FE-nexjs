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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('notifiable_id')
                    ->constrained('users')
                    ->nullOnDelete();
            $table->foreignId('actor_id')
                    ->constrained('users')
                    ->nullable()
                    ->nullOnDelete();
            $table->unsignedTinyInteger('type');
            $table->unsignedTinyInteger('entity_type')->nullable();
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->boolean('is_read')->default(false);
            $table->json('data')->nullable();
            $table->timestamps();

            $table->index(['notifiable_id', 'is_read', 'created_at']);
            $table->index(['actor_id']);
            $table->index(['entity_type', 'entity_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};