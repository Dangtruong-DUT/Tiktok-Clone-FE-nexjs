<?php

namespace App\Services;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use App\Enums\Common\ResourceTypeEnum;
use App\Exceptions\http\BusinessException;

class AppealOwnershipService
{
    public function __construct() {}

    /**
     * Validate ownership of a resource by email.
     */
    public function validate(
        string $email,
        string $resourceType,
        int $resourceId
    ): void {
        $resource = $this->resolveResource(
            resourceType: $resourceType,
            resourceId: $resourceId,
        );

        $ownerEmail = $this->extractOwnerEmail($resource);

        if (
            ! $ownerEmail ||
            ! hash_equals(
                mb_strtolower($ownerEmail),
                mb_strtolower($email)
            )
        ) {
            throw new BusinessException(
                'The provided email does not match the owner of this resource.'
            );
        }
    }

    /**
     * Resolve resource instance.
     * @param string $resourceType The type of the resource (e.g., 'user', 'post')
     * @param int $resourceId The ID of the resource
     * @return Model The resolved resource instance
     */
    private function resolveResource(
        string $resourceType,
        int $resourceId
    ): Model {
        $modelClass = $this->resolveModelClass($resourceType);

        $query = $this->buildResourceQuery($modelClass);

        $resource = $query->find($resourceId);

        if (! $resource) {
            throw new BusinessException('Resource not found.');
        }

        return $resource;
    }

    /**
     * Resolve model class from resource type.
     * @param string $resourceType The type of the resource (e.g., 'user', 'post')
     * @return string The fully qualified model class name
     */
    private function resolveModelClass(string $resourceType): string
    {
        return match ($resourceType) {
            ResourceTypeEnum::USER->value => User::class,
            ResourceTypeEnum::POST->value,
            ResourceTypeEnum::QUOTE_POST->value,
            ResourceTypeEnum::COMMENT->value,
            ResourceTypeEnum::RE_POST->value => Post::class,
            default => throw new BusinessException(
                "Unsupported resource type: {$resourceType}"
            ),
        };
    }

    /**
     * Build query with required relations.
     */
    private function buildResourceQuery(string $modelClass): Builder
    {
        $query = $modelClass::query();

        if (usesSoftDeletesTrait($modelClass)) {
            $query->withTrashed();
        }

        if ($modelClass !== User::class) {
            $query->with([
                'user' => fn ($query) => $query->withTrashed(),
            ]);
        }

        return $query;
    }

    /**
     * Extract owner email from resource.
     * @param Model $resource The resource instance (User, Post, etc.)
     * @return string|null The owner's email or null if not found
     */
    private function extractOwnerEmail(Model $resource): ?string
    {
        return match (true) {
            $resource instanceof User => $resource->email,
            method_exists($resource, 'user') => $resource->user?->email,
            default => null,
        };
    }
}
