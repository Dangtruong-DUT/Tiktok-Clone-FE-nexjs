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
     * @param  array  $mediaItems  Array of media data, each containing 'file_id' and 'type'.
     * @param  int  $postId  The ID of the post to associate the media with.
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
