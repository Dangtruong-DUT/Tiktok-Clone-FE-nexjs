<?php

namespace App\Services;

use App\Enums\Post\PostTypeEnum;
use App\Exceptions\http\BusinessException;
use App\Models\Post;
use App\Repositories\HashTagRepository;
use App\Repositories\MediaRepository;
use App\Repositories\PostRepository;
use App\Traits\HasAuthUser;
use Illuminate\Support\Facades\DB;

class PostService
{
    use HasAuthUser;
    /**
     * PostService constructor.
     */
    public function __construct(
        private readonly PostRepository $postRepo,
        private readonly MediaRepository $mediaRepo,
        private readonly HashTagRepository $hashTagRepo
    ) {}

    /**
     * Create a new post.
     * @param array $data
     * @return Post
     */
    public function createPost(array $data) : Post
    {

        $postType = $data['type']??PostTypeEnum::POST->value;

        if ($postType !== PostTypeEnum::POST->value && empty($data['parent_id'])) {
            throw new BusinessException('Parent ID is required for this post type.',[
                'type' => 'Parent ID is required for this post type.',
            ]);
        }
        $user = $this->guard()->user();
        $post = DB::transaction(function () use ($data, $postType, $user): Post {
            $post = $this->postRepo->create([
                'type' => $postType,
                'audience' => $data['audience'],
                'content' => $data['content'],
                'thumbnail_file_id' => $data['thumbnail'] ?? null,
                'user_id' => $user->id,
                'parent_id' => $data['parent_id'] ?? null,
            ]);
            if (!empty($data['mentions'])) {
                $post->mentions()->sync($data['mentions']);
            }
            if (!empty($data['hashtags'])) {
                $names = array_unique($data['hashtags']);
                $existing = $this->hashTagRepo->getByNames($names);
                $map = [];

                foreach ($existing as $tag) {
                    $map[$tag->name] = $tag->id;
                }

                $new = [];
                foreach ($names as $name) {
                    if (!isset($map[$name])) {
                        $new[] = ['name' => $name];
                    }
                }

                if (!empty($new)) {
                    $this->hashTagRepo->createMany($new);
                }

                $ids = $this->hashTagRepo->getByNames($names)->pluck('id')->toArray();
                $post->hashtags()->sync($ids);
            }

            if (!empty($data['medias'])) {
                $this->mediaRepo->createMany($data['medias'], $post->id);
            }
            return $post;
        });

        $postDetail= $this->postRepo->getByIdWithDetail($post->id, $user->id);
        return $postDetail;
    }
}
