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
     *
     * @param  int  $id
     * @return bool
     */
    public function isExist(int $id): bool
    {
        return $this->query()->whereKey($id)->exists();
    }

    /**
     * Check if upload file exists by uuid
     *
     * @param  string  $uuid
     * @return bool
     */
    public function isExistByUuid(string $uuid): bool
    {
        return $this->query()->where('uuid', $uuid)->exists();
    }

    /**
     * Find a upload file by uuid
     *
     * @param  string  $uuid
     * @return UploadFile|null
     */
    public function findByUuid(string $uuid): ?UploadFile
    {
        // @phpstan-ignore return.type
        return $this->query()->where('uuid', $uuid)->first();
    }
}
