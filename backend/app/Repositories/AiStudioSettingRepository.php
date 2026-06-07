<?php

namespace App\Repositories;

use App\Models\AiStudioSetting;

/**
 * @extends BaseRepository<AiStudioSetting>
 */
class AiStudioSettingRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(app()->make(AiStudioSetting::class));
    }


    /**
     * Get the current AI Studio settings.
     *
     * Since there is only one settings record, the first row is treated as current.
     *
     * @return AiStudioSetting
     */
    public function current(): AiStudioSetting
    {
        return $this->query()->firstOrFail();
    }
}
