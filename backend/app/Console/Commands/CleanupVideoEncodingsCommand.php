<?php

namespace App\Console\Commands;

use App\Actions\Video\DeleteVideoUploadAction;
use App\Enums\Video\VideoEncodingStatusEnum;
use App\Models\Media;
use App\Models\VideoEncoding;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CleanupVideoEncodingsCommand extends Command
{
    protected $signature = 'video:cleanup
                            {--days=7 : Remove FAILED records older than this many days}
                            {--orphan-hours=2 : Remove PENDING/PROCESSING/FAILED records not linked to a post, older than this many hours}
                            {--dry-run : Preview what would be deleted without deleting}';

    protected $description = 'Remove stale video encoding records, their S3 files, and orphaned uploads not linked to any post';

    public function handle(DeleteVideoUploadAction $deleteAction): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $totalDeleted = 0;

        $totalDeleted += $this->cleanupOrphans($deleteAction, $dryRun);
        $totalDeleted += $this->cleanupOldFailed($deleteAction, $dryRun);

        if (! $dryRun) {
            Log::info('video:cleanup completed', ['deleted' => $totalDeleted]);
        }

        return self::SUCCESS;
    }

    private function cleanupOrphans(DeleteVideoUploadAction $deleteAction, bool $dryRun): int
    {
        $hours = (int) $this->option('orphan-hours');
        $cutoff = now()->subHours($hours);

        $linkedUploadFileIds = Media::pluck('upload_file_id')->all();

        $query = VideoEncoding::whereIn('status', [
            VideoEncodingStatusEnum::PENDING,
            VideoEncodingStatusEnum::PROCESSING,
            VideoEncodingStatusEnum::FAILED,
        ])
            ->where('updated_at', '<', $cutoff)
            ->with('uploadFile')
            ->whereHas('uploadFile', function ($q) use ($linkedUploadFileIds) {
                $q->whereNotIn('id', $linkedUploadFileIds);
            });

        $count = $query->count();

        if ($count === 0) {
            $this->info("No orphaned encodings found (older than {$hours} hours, not linked to any post).");

            return 0;
        }

        if ($dryRun) {
            $this->warn("[dry-run] Would delete {$count} orphaned encoding(s) older than {$hours} hours.");

            return 0;
        }

        $deleted = 0;
        $query->each(function (VideoEncoding $encoding) use ($deleteAction, &$deleted) {
            if ($encoding->uploadFile) {
                $deleteAction->execute($encoding->uploadFile);
                $deleted++;
            } else {
                $encoding->delete();
                $deleted++;
            }
        });

        $this->info("Deleted {$deleted} orphaned encoding(s) older than {$hours} hours.");

        return $deleted;
    }

    private function cleanupOldFailed(DeleteVideoUploadAction $deleteAction, bool $dryRun): int
    {
        $days = (int) $this->option('days');
        $cutoff = now()->subDays($days);

        $query = VideoEncoding::where('status', VideoEncodingStatusEnum::FAILED)
            ->where('updated_at', '<', $cutoff)
            ->with('uploadFile');

        $count = $query->count();

        if ($count === 0) {
            $this->info("No stale FAILED encodings found (older than {$days} days).");

            return 0;
        }

        if ($dryRun) {
            $this->warn("[dry-run] Would delete {$count} FAILED encoding(s) older than {$days} days.");

            return 0;
        }

        $deleted = 0;
        $query->each(function (VideoEncoding $encoding) use ($deleteAction, &$deleted) {
            if ($encoding->uploadFile) {
                $deleteAction->execute($encoding->uploadFile);
            } else {
                $encoding->delete();
            }
            $deleted++;
        });

        $this->info("Deleted {$deleted} stale FAILED encoding(s) older than {$days} days.");

        return $deleted;
    }
}
