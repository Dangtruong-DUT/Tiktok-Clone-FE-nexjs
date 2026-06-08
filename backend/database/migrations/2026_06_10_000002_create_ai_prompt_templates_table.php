<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_prompt_templates', function (Blueprint $table) {
            $table->id();
            $table->string('intent', 50)->unique();
            $table->string('display_name', 150);
            $table->text('system_prompt');
            $table->text('user_template');
            $table->json('few_shot_examples')->nullable();
            $table->json('output_schema')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('version')->default(1);
            $table->foreignId('created_by')->nullable()->nullOnDelete()->constrained('users');
            $table->foreignId('updated_by')->nullable()->nullOnDelete()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_prompt_templates');
    }
};
