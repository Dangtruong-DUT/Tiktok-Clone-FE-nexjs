<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table): void {
            $table->id();
            $table->unsignedSmallInteger('type')->comment('1: private, 2: group');
            $table->timestamps();
        });

        Schema::create('conversation_participants', function (Blueprint $table): void {
            $table->unsignedBigInteger('conversation_id');
            $table->unsignedBigInteger('user_id');
            $table->timestamp('last_read_at')->nullable();

            $table->primary(['conversation_id', 'user_id']);
            $table->index('user_id');

            $table->foreign('conversation_id')
                ->references('id')
                ->on('conversations')
                ->cascadeOnDelete();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
        });

        Schema::create('messages', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('conversation_id');
            $table->unsignedBigInteger('sender_id')->nullable();
            $table->text('content');
            $table->unsignedSmallInteger('type')->comment('1: text, 2: image, 3: video, 4: system');
            $table->unsignedBigInteger('reply_to_id')->nullable();
            $table->timestamps();

            $table->index(['conversation_id', 'created_at']);
            $table->index('sender_id');

            $table->foreign('conversation_id')
                ->references('id')
                ->on('conversations')
                ->cascadeOnDelete();

            $table->foreign('sender_id')
                ->references('id')
                ->on('users')
                ->nullOnDelete();

            $table->foreign('reply_to_id')
                ->references('id')
                ->on('messages')
                ->nullOnDelete();
        });

        Schema::create('message_medias', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('message_id');
            $table->unsignedBigInteger('upload_file_id');
            $table->unsignedSmallInteger('type');
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index('message_id');

            $table->foreign('message_id')
                ->references('id')
                ->on('messages')
                ->cascadeOnDelete();

            $table->foreign('upload_file_id')
                ->references('id')
                ->on('upload_files')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_medias');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('conversation_participants');
        Schema::dropIfExists('conversations');
    }
};
