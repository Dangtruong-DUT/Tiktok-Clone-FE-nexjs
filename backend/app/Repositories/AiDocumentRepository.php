<?php

namespace App\Repositories;

use App\Models\AiDocument;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * @extends BaseRepository<AiDocument>
 */
class AiDocumentRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(app()->make(AiDocument::class));
    }

    /**
     * Paginate documents ordered by latest first.
     *
     * @param  int  $perPage
     * @return LengthAwarePaginator
     */
    public function paginateLatest(int $perPage = 20): LengthAwarePaginator
    {
        return $this->query()
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Find a document by UUID or throw 404.
     *
     * @param  string  $uuid
     * @return AiDocument
     */
    public function findByUuid(string $uuid): AiDocument
    {
        return $this->query()->where('uuid', $uuid)->firstOrFail();
    }
}
