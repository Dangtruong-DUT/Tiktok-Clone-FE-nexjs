<?php

namespace App\Libraries\Upload;

use App\Contracts\Upload\UploadFileServiceInterface;
use App\Models\UploadFile;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MinioUploadFileService implements UploadFileServiceInterface
{
    /**
     * Upload a file to Minio S3 storage and create a record in the upload_files table.
     *
     * @param  UploadedFile  $file  The uploaded file
     * @param  string  $directory  The directory to store the file in
     * @param  Relation|null  $relation  The Relation to associate the file with
     * @return UploadFile The created UploadFile record
     */
    public function uploadFile(
        UploadedFile $file,
        string $directory,
        ?Relation $relation = null
    ): UploadFile {

        $filename = Str::uuid()->toString().'.'.$file->getClientOriginalExtension();

        $disk = Storage::disk('s3');

        try {
            $path = $disk->putFileAs($directory, $file, $filename, 'public');

            if (! $path) {
                throw new \Exception('Failed to upload file to Minio');
            }

            $uploadFile = new UploadFile([
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'mime_type' => $file->getMimeType() ?? $file->getClientMimeType(),
                'file_size' => $file->getSize(),
                'disk' => 's3',
            ]);

            if ($relation) {
                $relation->save($uploadFile);
            } else {
                $uploadFile->save();
            }

            return $uploadFile;
        } catch (\Exception $e) {
            Log::error('Error uploading file to Minio: '.$e->getMessage(), [
                'exception' => $e,
                'file' => $file->getClientOriginalName(),
            ]);
            throw $e;
        }
    }

    /**
     * Delete a file from Minio S3 storage and its record.
     *
     * @param  UploadFile  $uploadFile  The file to delete
     * @return bool True if the file was deleted
     */
    public function deleteFile(UploadFile $uploadFile): bool
    {
        if ($uploadFile->disk === 's3' && Storage::disk('s3')->exists($uploadFile->file_path)) {
            Storage::disk('s3')->delete($uploadFile->file_path);
        }

        return $uploadFile->delete();
    }
}
