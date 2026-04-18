<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appeals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('appeal_type'); // user_ban, post_hidden, post_deleted, comment_deleted
            $table->unsignedBigInteger('resource_id')->nullable(); // post_id or comment_id
            $table->string('resource_type'); // App\Enums\Common\ResourceTypeEnum
            $table->text('reason'); // User's appeal reason
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->text('admin_response')->nullable(); // Admin's response
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
            $table->index('appeal_type');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appeals');
    }
};
