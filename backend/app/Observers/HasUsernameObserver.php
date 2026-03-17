<?php

namespace App\Observers;

use Illuminate\Database\Eloquent\Model;

class HasUsernameObserver
{
    public function creating(Model $model): void
    {
        if (empty($model->username)) {
            // @phpstan-ignore property.notFound
            $model->username = generate_username('user');
        }
    }
}