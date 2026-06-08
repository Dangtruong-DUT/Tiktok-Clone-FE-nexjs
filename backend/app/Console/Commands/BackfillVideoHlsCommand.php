<?php

namespace App\Console\Commands;

use App\Actions\Video\InitiateVideoProcessingAction;
use App\Enums\Media\MediaTypeEnum;
use App\Models\Media;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class BackfillVideoHlsCommand extends Command
{
    protected $signature = 'video:backfill-hls
                            {--dry-run : Preview what would be queued without dispatching}
                            {--limit=0 : Max records to process (0 = all)}';

    protected $description = 'Queue HLS encoding for VIDEO type media that have not been encoded yet';

    public function handle(InitiateVideoProcessingAction $action): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $limit = (int) $this->option('limit');

        $query = Media::where('type', MediaTypeEnum::VIDEO)
            ->with('file.videoEncoding')
            ->when($limit > 0, fn ($q) => $q->limit($limit));

        $total = $query->count();

        if ($total === 0) {
            $this->info('No VIDEO type media found to backfill.');

            return self::SUCCESS;
        }

        if ($dryRun) {
            $this->warn("[dry-run] Would queue HLS encoding for up to {$total} media record(s).");

            return self::SUCCESS;
        }

        $queued = 0;
        $skipped = 0;

        $query->each(function (Media $media) use ($action, &$queued, &$skipped) {
            $uploadFile = $media->file;

            if (! $uploadFile) {
                $skipped++;

                return;
            }

            if ($uploadFile->videoEncoding) {
                $skipped++;

                return;
            }

            $action->execute($uploadFile);
            $queued++;
        });

        $this->info("Queued: {$queued} | Skipped (already has encoding): {$skipped}");
        Log::info('video:backfill-hls completed', ['queued' => $queued, 'skipped' => $skipped]);

        return self::SUCCESS;
    }
}
