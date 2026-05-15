<?php

namespace App\Services;

use App\Models\Hashtag;
use Illuminate\Pagination\LengthAwarePaginator;

class HashtagService
{
    /**
     * Search for hashtags.
     * @param  array{q?: string, per_page?: int}  $data
     */
    public function search(array $data): LengthAwarePaginator
    {
        $query = $data['q'] ?? '';
        $perPage = $data['per_page'] ?? config('const.pagination.default_per_page', 15);

        return Hashtag::query()
            ->where('name', 'like', '%'.$query.'%')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }
}
