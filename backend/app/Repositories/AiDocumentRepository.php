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
        parent::__construct(new AiDocument());
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
}
