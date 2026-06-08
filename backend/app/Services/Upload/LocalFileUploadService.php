<?php

namespace App\Services\Upload;

use App\Contracts\Upload\UploadFileServiceInterface;
use App\Models\UploadFile;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Uploads files to local public disk and persists an UploadFile record.
 * Used when the filesystems.default driver is not s3/minio (local dev without MinIO).
 */
class LocalFileUploadService implements UploadFileServiceInterface
{
    /**
     * Upload a file to local public storage and create a record in the upload_files table.
     *
     * @param  UploadedFile  $file
     * @param  string  $directory
     * @param  Relation|null  $relation  Eloquent relation to associate the record with
     * @return UploadFile
     */
    public function uploadFile(
        UploadedFile $file,
        string $directory,
        ?Relation $relation = null,
    ): UploadFile {
        $filename   = Str::uuid()->toString() . '.' . $file->getClientOriginalExtension();
        $path       = $file->storeAs($directory, $filename, 'public');

        $uploadFile = new UploadFile([
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime_type' => $file->getMimeType() ?? $file->getClientMimeType(),
            'file_size' => $file->getSize(),
            'disk'      => 'public',
        ]);

        if ($relation) {
            $relation->save($uploadFile);
        } else {
            $uploadFile->save();
        }

        return $uploadFile;
    }

    /**
     * Delete a file from local public storage and remove its database record.
     *
     * @param  UploadFile  $uploadFile
     * @return bool
     */
    public function deleteFile(UploadFile $uploadFile): bool
    {
        if ($uploadFile->disk === 'public' && Storage::disk('public')->exists($uploadFile->file_path)) {
            Storage::disk('public')->delete($uploadFile->file_path);
        }

        return $uploadFile->delete();
    }
}
