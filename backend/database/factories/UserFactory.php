<?php

namespace Database\Factories;

use App\Enums\User\UserVerifyStatusEnum;
use App\Models\User;
use App\Models\UserSettings;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{

    /**
    * The name of the factory's corresponding model.
    *
    * @var class-string<\Illuminate\Database\Eloquent\Model>
    */
    protected $model = User::class;

    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Configure the factory.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (User $user): void {
            UserSettings::firstOrCreate([
                'user_id' => $user->id,
            ]);
        });
    }

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            "uuid" => fake()->uuid(),
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            "username" => generate_username(fake()->name()),
            "bio" => fake()->sentence(),
            "location" => fake()->city(),
            "website" => fake()->url(),
            "date_of_birth" => fake()->date(),
            "verify" => fake()->randomElement([0, 1]),
            'password' => static::$password ??= 'password',
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'verify' =>UserVerifyStatusEnum::UNVERIFIED->value,
        ]);
    }

    /**
     * Indicate that the model's email address should be verified.
     */
    public function verified(): static
    {
        return $this->state(fn(array $attributes) => [
            'verify' => UserVerifyStatusEnum::VERIFIED->value,
        ]);
    }

    /**
     * Indicate that the model's email address should be banned.
     */
    public function banned(): static
    {
        return $this->state(fn(array $attributes) => [
            'verify' => UserVerifyStatusEnum::BANNED->value,
        ]);
    }


}
