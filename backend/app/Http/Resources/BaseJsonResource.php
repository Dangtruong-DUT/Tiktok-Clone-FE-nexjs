<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
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
     * @return BaseResourceCollection
     */
    public static function collection($resource): BaseResourceCollection
    {
        return tap(new BaseResourceCollection($resource, static::class), function ($collection): void {
            if (property_exists(static::class, 'preserveKeys')) {
                // @phpstan-ignore new.static
                $class = (new static([]));
                // @phpstan-ignore property.notFound
                $collection->preserveKeys = $class->preserveKeys === true;
            }
        });
    }
}
