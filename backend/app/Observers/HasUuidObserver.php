<?php

namespace App\Observers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class HasUuidObserver
{
    /**
     * Handle the Model "creating" event.
 */
    public function creating(Model $model): void
    {
        if (empty($model->uuid)) {
            /** @phpstan-ignore-next-line */
            $model->uuid = (string) Str::uuid();
        }
    }
}
