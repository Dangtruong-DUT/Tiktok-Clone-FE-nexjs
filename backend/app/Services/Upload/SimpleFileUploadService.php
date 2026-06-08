<?php

namespace App\Services\Upload;

use App\Contracts\Upload\UploadFileServiceInterface;
use App\Models\UploadFile;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Uploads files to S3/MinIO via the Laravel Storage facade and persists an UploadFile record.
 */
class SimpleFileUploadService implements UploadFileServiceInterface
{
    /**
     * Upload a file to S3 storage and create a record in the upload_files table.
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
        $filename = Str::uuid()->toString() . '.' . $file->getClientOriginalExtension();
        $disk     = Storage::disk('s3');

        try {
            $path = $disk->putFileAs($directory, $file, $filename, 'public');

            if (! $path) {
                throw new \RuntimeException('Failed to upload file to S3 storage.');
            }

            $uploadFile = new UploadFile([
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'mime_type' => $file->getMimeType() ?? $file->getClientMimeType(),
                'file_size' => $file->getSize(),
                'disk'      => 's3',
            ]);

            if ($relation) {
                $relation->save($uploadFile);
            } else {
                $uploadFile->save();
            }

            return $uploadFile;
        } catch (\Exception $e) {
            Log::error('Error uploading file to S3 storage', [
                'file'      => $file->getClientOriginalName(),
                'exception' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Delete a file from S3 storage and remove its database record.
     *
     * @param  UploadFile  $uploadFile
     * @return bool
     */
    public function deleteFile(UploadFile $uploadFile): bool
    {
        if ($uploadFile->disk === 's3' && Storage::disk('s3')->exists($uploadFile->file_path)) {
            Storage::disk('s3')->delete($uploadFile->file_path);
        }

        return $uploadFile->delete();
    }
}
