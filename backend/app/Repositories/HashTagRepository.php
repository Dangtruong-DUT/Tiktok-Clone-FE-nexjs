<?php
namespace App\Repositories;

use App\Models\HashTag;
use App\Repositories\BaseRepository;

class HashTagRepository  extends BaseRepository
{


    /**
     * HashTagRepository constructor.
     */
    public function __construct()
    {
        $modelInstance = app()->make(HashTag::class);
        parent::__construct($modelInstance);
    }

    /**
     * Find a hashtag by name.
     * @param string $name
     * @return HashTag|null
     */
    public function findByName(string $name): ?HashTag
    {
        return $this->query()->where('name', $name)->first();
    }

    /**
     * Get hashtags by an array of names.
     * @param array $names
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getByNames(array $names)
    {
        return $this->query()->whereIn('name', $names)->get();
    }

    /**
     * Create multiple hashtags.
     * @param array $data
     * @return array
     */
    public function createMany(array $data): array
    {
        $createdHashTags = [];
        foreach ($data as $item) {
            $createdHashTags[] = $this->query()->create($item);
        }
        return $createdHashTags;
    }
}
