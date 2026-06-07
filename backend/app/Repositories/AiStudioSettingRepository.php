<?php
namespace App\Repositories;

use App\Models\AiStudioSetting;
use App\Repositories\BaseRepository;

class AiStudioSettingRepository extends BaseRepository
{
    public function __construct() {
        parent::__construct(app()->make(AiStudioSetting::class));
    }

    /**
     * Get the current AI Studio settings.
     * Since there's only one settings record, we can just fetch the first one.
     * @return AiStudioSetting
     */
    public function current(): AiStudioSetting
    {
        return $this->query()->firstOrFail();
    }
}
