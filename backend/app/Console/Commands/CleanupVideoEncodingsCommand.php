<?php

namespace App\Console\Commands;

use App\Enums\Video\VideoEncodingStatusEnum;
use App\Models\VideoEncoding;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CleanupVideoEncodingsCommand extends Command
{
    protected $signature = 'video:cleanup
                            {--days=7 : Remove FAILED records older than this many days}
                            {--dry-run : Preview what would be deleted without deleting}';

    protected $description = 'Remove stale FAILED video encoding records and their temp directories';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $dryRun = (bool) $this->option('dry-run');
        $cutoff = now()->subDays($days);

        $query = VideoEncoding::where('status', VideoEncodingStatusEnum::FAILED)
            ->where('updated_at', '<', $cutoff);

        $count = $query->count();

        if ($count === 0) {
            $this->info("No stale FAILED encodings found (older than {$days} days).");

            return self::SUCCESS;
        }

        if ($dryRun) {
            $this->warn("[dry-run] Would delete {$count} encoding record(s) older than {$days} days.");

            return self::SUCCESS;
        }

        $deleted = 0;
        $query->with('uploadFile')->each(function (VideoEncoding $encoding) use (&$deleted) {
            $uuid = $encoding->uploadFile?->uuid;

            if ($uuid) {
                $tempDir = rtrim(config('video.temp_directory'), DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR.$uuid;
                if (is_dir($tempDir)) {
                    $this->deleteDirectory($tempDir);
                }
            }

            $encoding->delete();
            $deleted++;
        });

        $this->info("Deleted {$deleted} stale FAILED encoding record(s).");
        Log::info('video:cleanup completed', ['deleted' => $deleted, 'older_than_days' => $days]);

        return self::SUCCESS;
    }

    private function deleteDirectory(string $dir): void
    {
        foreach (array_diff(scandir($dir), ['.', '..']) as $entry) {
            $path = $dir.DIRECTORY_SEPARATOR.$entry;
            is_dir($path) ? $this->deleteDirectory($path) : unlink($path);
        }
        rmdir($dir);
    }
}
