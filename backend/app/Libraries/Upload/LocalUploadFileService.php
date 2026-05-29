<?php

namespace App\Libraries\Upload;

use App\Contracts\Upload\UploadFileServiceInterface;
use App\Models\UploadFile;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class LocalUploadFileService implements UploadFileServiceInterface
{
    /**
     * Upload a file and create a record in the upload_files table.
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

        $path = $file->storeAs($directory, $filename, 'public');

        $uploadFile = new UploadFile([
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime_type' => $file->getMimeType() ?? $file->getClientMimeType(),
            'file_size' => $file->getSize(),
            'disk' => 'public',
        ]);

        if ($relation) {
            $relation->save($uploadFile);
        } else {
            $uploadFile->save();
        }

        return $uploadFile;
    }

    /**
     * Delete a file and its record.
     *
     * @param  UploadFile  $uploadFile  The file to delete
     * @return bool True if the file was deleted
     */
    public function deleteFile(UploadFile $uploadFile): bool
    {
        if ($uploadFile->disk === 'public' && Storage::disk('public')->exists($uploadFile->file_path)) {
            Storage::disk('public')->delete($uploadFile->file_path);
        }

        return $uploadFile->delete();
    }
}
