<?php

use App\Enums\Settings\PrivacyVisibilityEnum;
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
        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->tinyInteger('liked_videos_visibility')->default(PrivacyVisibilityEnum::PUBLIC->value);
            $table->tinyInteger('bookmarked_videos_visibility')->default(PrivacyVisibilityEnum::PUBLIC->value);
            $table->tinyInteger('followers_visibility')->default(PrivacyVisibilityEnum::PUBLIC->value);
            $table->tinyInteger('following_visibility')->default(PrivacyVisibilityEnum::PUBLIC->value);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_settings');
    }
};
