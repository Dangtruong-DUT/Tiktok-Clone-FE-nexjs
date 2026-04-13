<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations - Create activity_logs table to track system-wide events
     * Logs: user_created, post_uploaded, post_liked, comment_added, user_followed, user_banned, etc
     */
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->setOnDelete('set null');
            $table->string('activity_type'); // 'user_created', 'post_uploaded', 'post_liked', 'comment_added', etc
            $table->string('resource_type')->nullable(); // 'user', 'post', 'comment', 'notification'
            $table->string('resource_id')->nullable(); // User ID, Post UUID, Comment ID
            $table->longText('metadata')->nullable(); // JSON - additional context
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            // Indexes for filtering
            $table->index('user_id');
            $table->index('activity_type');
            $table->index(['resource_type', 'resource_id']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
