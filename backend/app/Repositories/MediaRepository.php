<?php

namespace App\Repositories;

use App\Models\Media;

class MediaRepository extends BaseRepository
{
    public function __construct()
    {
        $modelInstance = app()->make(Media::class);
        parent::__construct($modelInstance);
    }

    /**
     * Create or update multiple media records for a post.
     *
     * @param  array<int, array{file_id: int, type: string}>  $mediaItems
     * @param  int  $postId
     * @return void
     */
    public function createMany(array $mediaItems, int $postId): void
    {
        foreach ($mediaItems as $mediaItem) {
            $this->query()->updateOrCreate(
                [
                    'post_id' => $postId,
                    'upload_file_id' => $mediaItem['file_id'],
                ],
                [
                    'type' => $mediaItem['type'],
                ]
            );
        }
    }
}
