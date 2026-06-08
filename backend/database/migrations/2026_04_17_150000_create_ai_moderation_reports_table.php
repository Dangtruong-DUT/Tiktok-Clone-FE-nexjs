<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_moderation_reports', function (Blueprint $table) {
            $table->id();
            $table->string('task_id')->unique();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('resource_type'); // App\Enums\Common\ResourceTypeEnum
            $table->unsignedBigInteger('resource_id');
            $table->text('sentence');
            $table->unsignedTinyInteger('label');
            $table->decimal('confidence', 8, 6);
            $table->boolean('is_violation')->default(false);
            $table->text('violation_reason')->nullable();
            $table->json('raw_payload')->nullable();
            $table->timestamp('moderated_at')->nullable();
            $table->timestamp('appeal_deadline_at')->nullable();
            $table->string('status')->default('open');
            $table->timestamps();

            $table->index(['resource_type', 'resource_id']);
            $table->index(['user_id', 'status']);
            $table->index('appeal_deadline_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_moderation_reports');
    }
};
