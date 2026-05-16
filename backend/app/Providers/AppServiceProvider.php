<?php

namespace App\Providers;

use App\Enums\Common\ModelEntityTypeEnum;
use App\Models\Hashtag;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\App;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Fail-fast: never run with debug enabled in production.
        if (App::isProduction() && config('app.debug')) {
            throw new \RuntimeException('APP_DEBUG must be false in production.');
        }

        Model::shouldBeStrict(! App::isProduction());

        Relation::enforceMorphMap([
            ModelEntityTypeEnum::POST->value => Post::class,
            ModelEntityTypeEnum::USER->value => User::class,
            ModelEntityTypeEnum::HASHTAG->value => Hashtag::class,
        ]);
    }
}
