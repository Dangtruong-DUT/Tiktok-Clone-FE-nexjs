<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\ServiceProvider;

class EloquentServiceProvider extends ServiceProvider
{
    /**
     * Register services.
 */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
 */
    public function boot(): void
    {
        Builder::macro('orderByMultiple', function (array $orderBy) {
            /** @var \Illuminate\Database\Eloquent\Builder $this */
            foreach ($orderBy as $column) {
                // Handle array format: ['column' => 'name', 'direction' => 'asc']
                if (is_array($column)) {
                    $columnName = $column['column'] ?? $column[0] ?? null;
                    $direction = $column['direction'] ?? $column[1] ?? 'asc';

                    if ($columnName) {
                        $this->orderBy($columnName, strtolower($direction) === 'desc' ? 'desc' : 'asc');
                    }
                }
                // Handle string format: 'name' or '-name'
                elseif (is_string($column)) {
                    if (str_starts_with($column, '-')) {
                        $this->orderByDesc(substr($column, 1));
                    } else {
                        $this->orderBy(ltrim($column, '+'));
                    }
                }
            }

            return $this;
        });
    }
}
