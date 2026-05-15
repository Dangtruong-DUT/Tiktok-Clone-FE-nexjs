<?php

namespace App\Repositories;

use App\Models\UploadFile;

class UploadFileRepository extends BaseRepository
{
    public function __construct()
    {
        $modelInstance = app()->make(UploadFile::class);
        parent::__construct($modelInstance);
    }

    /**
     * Check if upload file exists
     */
    public function isExist(int $id): bool
    {
        return $this->query()->where('id', $id)->exists();
    }

    /**
     * Check if upload file exists by uuid
     */
    public function isExistByUuid(string $uuid): bool
    {
        return $this->query()->where('uuid', $uuid)->exists();
    }

    /**
     * Find a upload file by uuid
     */
    public function findByUuid(string $uuid): ?UploadFile
    {
        // @phpstan-ignore return.type
        return $this->query()->where('uuid', $uuid)->first();
    }
}
