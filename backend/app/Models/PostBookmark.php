<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostBookmark extends Model
{
    /*
    * Get the attributes that should be cast.
    *
    * @return array<string, string>
    */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }
}
