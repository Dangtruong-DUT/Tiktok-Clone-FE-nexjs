<?php
namespace App\Repositories;

use App\Models\Media;
use App\Repositories\BaseRepository;

class MediaRepository  extends BaseRepository
{


    /**
     * PostRepository constructor.
     */
    public function __construct()
    {
        $modelInstance = app()->make(Media::class);
        parent::__construct($modelInstance);
    }

    /**
     * Create or update multiple media records for a post.
     *
     * @param array $array Array of media data, each containing 'file_id' and 'type'.
     * @param int $postId The ID of the post to associate the media with.
     */
    public function createMany(array $array, int $postId): void
    {
        foreach ($array as $item) {
            $this->query()->updateOrCreate(
                [
                    'post_id' => $postId,
                    'upload_file_id' => $item['file_id'],
                ],
                [
                    'type' => $item['type'],
                ]
            );
        }
    }
}
