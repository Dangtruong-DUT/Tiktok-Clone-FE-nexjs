<?php

namespace Database\Seeders;

use App\Enums\User\RoleTypeEnum;
use App\Enums\User\UserVerifyStatusEnum;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $adminUser = User::where('email', env('SYSTEM_ADMIN_EMAIL'))->first();
        if (!$adminUser) {
            $adminUser = User::factory()->create([
                'username' => env('SYSTEM_ADMIN_USER_NAME'),
                'password' => env('SYSTEM_ADMIN_PASSWORD'),
                'email' => env('SYSTEM_ADMIN_EMAIL'),
                'verify' => UserVerifyStatusEnum::VERIFIED->value,
                'role'=> RoleTypeEnum::SUPER_ADMIN->value,
            ]);
        }

        $this->call([
            UserSeeder::class,
        ]);

    }
}
