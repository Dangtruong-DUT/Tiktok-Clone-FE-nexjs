<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations - Create admin_logs table to track all admin actions
     * Logs: ban, unban, delete user, hide post, delete post, delete comment, etc.
     */
    public function up(): void
    {
        Schema::create('admin_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->constrained('users')->cascadeOnDelete();
            $table->string('resource_type');  // 'user', 'post', 'comment'
            $table->string('resource_id');     // User ID, Post UUID, Comment ID (string for flexibility)
            $table->string('action');          // 'ban', 'unban', 'hide', 'delete', etc
            $table->text('reason')->nullable();
            $table->longText('old_data')->nullable(); // JSON backup of old state
            $table->longText('new_data')->nullable(); // JSON of new state
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->index('admin_id');
            $table->index(['resource_type', 'resource_id']);
            $table->index('action');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_logs');
    }
};
