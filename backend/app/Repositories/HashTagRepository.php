<?php

namespace App\Repositories;

use App\Models\Hashtag;
use Illuminate\Database\Eloquent\Collection;

class HashtagRepository extends BaseRepository
{
    /**
     * HashtagRepository constructor.
     */
    public function __construct()
    {
        $modelInstance = app()->make(Hashtag::class);
        parent::__construct($modelInstance);
    }

    /**
     * Find a hashtag by name.
     */
    public function findByName(string $name): ?Hashtag
    {
        return $this->query()->where('name', $name)->first();
    }

    /**
     * Get hashtags by an array of names.
     */
    public function getByNames(array $names): Collection
    {
        return $this->query()->whereIn('name', $names)->get();
    }

    /**
     * Create multiple hashtags.
     */
    public function createMany(array $data): array
    {
        $createdHashtags = [];
        foreach ($data as $item) {
            $createdHashtags[] = $this->query()->create($item);
        }

        return $createdHashtags;
    }
}
