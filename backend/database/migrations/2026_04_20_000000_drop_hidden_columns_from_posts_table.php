<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            if (Schema::hasColumn('posts', 'hidden_at')) {
                $table->dropColumn('hidden_at');
            }

            if (Schema::hasColumn('posts', 'hidden_reason')) {
                $table->dropColumn('hidden_reason');
            }
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            if (!Schema::hasColumn('posts', 'hidden_at')) {
                $table->timestamp('hidden_at')->nullable();
            }

            if (!Schema::hasColumn('posts', 'hidden_reason')) {
                $table->text('hidden_reason')->nullable();
            }

            if (Schema::hasColumn('posts', 'hidden_at')) {
                $table->index('hidden_at');
            }
        });
    }
};
