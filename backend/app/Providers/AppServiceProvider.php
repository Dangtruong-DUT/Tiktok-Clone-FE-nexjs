<?php

namespace App\Providers;

use App\Enums\Common\ModelEntityTypeEnum;
use App\Models\Hashtag;
use App\Models\Post;
use App\Models\User;
use Gemini\Client as GeminiClient;
use Gemini\Contracts\ClientContract as GeminiClientContract;
use GuzzleHttp\Client as GuzzleClient;
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
        // Override the Gemini client binding to send the API key both as header
        // (x-goog-api-key) AND as query param (?key=) for compatibility with
        // non-standard key formats (e.g. AQ.Ab8... keys from Google Cloud console).
        $this->app->singleton(GeminiClientContract::class, static function (): GeminiClient {
            $apiKey  = (string) config('gemini.api_key', '');
            $baseUrl = (string) config('gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta');
            $timeout = (int)    config('gemini.request_timeout', 30);

            return \Gemini::factory()
                ->withApiKey(apiKey: $apiKey)
                ->withQueryParam(name: 'key', value: $apiKey)
                ->withBaseUrl(baseUrl: $baseUrl)
                ->withHttpClient(client: new GuzzleClient(['timeout' => $timeout]))
                ->make();
        });

        $this->app->alias(GeminiClientContract::class, GeminiClient::class);
        $this->app->alias(GeminiClientContract::class, 'gemini');
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
