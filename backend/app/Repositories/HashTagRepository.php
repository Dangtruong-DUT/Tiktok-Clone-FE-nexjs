<?php
namespace App\Repositories;

use App\Models\Hashtag;
use App\Repositories\BaseRepository;

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
     * @param string $name
     * @return Hashtag|null
     */
    public function findByName(string $name): ?Hashtag
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
        $createdHashtags = [];
        foreach ($data as $item) {
            $createdHashtags[] = $this->query()->create($item);
        }
        return $createdHashtags;
    }
}
