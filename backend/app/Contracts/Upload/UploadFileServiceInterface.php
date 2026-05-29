<?php

namespace App\Contracts\Upload;

use App\Models\UploadFile;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\UploadedFile;

interface UploadFileServiceInterface
{
    /**
     * Upload a file and create a record in the upload_files table.
     *
     * @param  UploadedFile  $file  The uploaded file
     * @param  string  $directory  The directory to store the file in
     * @param  Relation|null  $relation  The model to associate the file with
     * @return UploadFile The created UploadFile record
     */
    public function uploadFile(
        UploadedFile $file,
        string $directory,
        ?Relation $relation = null
    ): UploadFile;

    /**
     * Delete a file and its record.
     *
     * @param  UploadFile  $uploadFile  The file to delete
     * @return bool True if the file was deleted
     */
    public function deleteFile(UploadFile $uploadFile): bool;
}
