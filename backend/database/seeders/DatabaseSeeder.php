<?php

namespace Database\Seeders;

use App\Enums\User\UserVerifyStatus;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $adminUser = User::where('email', env('SYSTEM_ADMIN_EMAIL'))->first();
        if (!$adminUser) {
            $adminUser = User::factory()->create([
                'user_name' => env('SYSTEM_ADMIN_USER_NAME'),
                'password' => env('SYSTEM_ADMIN_PASSWORD'),
                'email' => env('SYSTEM_ADMIN_EMAIL'),
                'user_status' => UserVerifyStatus::ACTIVE->value,
            ]);
        }
        // $this->call([]);

    }
}
