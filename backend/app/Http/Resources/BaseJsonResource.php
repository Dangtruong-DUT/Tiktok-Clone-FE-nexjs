<?php

namespace App\Http\Resources;

use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;

class BaseJsonResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return parent::toArray($request);
    }

    /**
     * Create a new anonymous resource collection.
     *
     * @param mixed $resource
     * @return AnonymousResourceCollection
     */
    public static function collection($resource): AnonymousResourceCollection
    {
        return tap(new AnonymousResourceCollection($resource, static::class), function ($collection): void {
            if (property_exists(static::class, 'preserveKeys')) {
                // @phpstan-ignore new.static
                $class = (new static([]));
                // @phpstan-ignore property.notFound
                $collection->preserveKeys = $class->preserveKeys === true;
            }
        });
    }

    protected function requireAttribute(string $key)
    {
        if (!array_key_exists($key, $this->resource->getAttributes())) {
            Log::warning("Missing attribute: {$key}");
        }
    }
}
