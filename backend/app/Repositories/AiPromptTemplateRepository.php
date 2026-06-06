<?php

namespace App\Repositories;

use App\Models\AiPromptTemplate;

/**
 * @extends BaseRepository<AiPromptTemplate>
 */
class AiPromptTemplateRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(new AiPromptTemplate());
    }

    public function findByIntent(string $intent): ?AiPromptTemplate
    {
        /** @var AiPromptTemplate|null */
        return $this->query()
            ->where('intent', $intent)
            ->where('is_active', true)
            ->first();
    }

    public function findByIntentAny(string $intent): ?AiPromptTemplate
    {
        /** @var AiPromptTemplate|null */
        return $this->query()->where('intent', $intent)->first();
    }

    /** @return \Illuminate\Database\Eloquent\Collection<int, AiPromptTemplate> */
    public function allActive()
    {
        return $this->query()->where('is_active', true)->orderBy('intent')->get();
    }

    public function updateByIntent(string $intent, array $data, int $updatedBy): AiPromptTemplate
    {
        /** @var AiPromptTemplate */
        $template = $this->query()->where('intent', $intent)->firstOrFail();
        $template->update(array_merge($data, [
            'updated_by' => $updatedBy,
            'version'    => $template->version + 1,
        ]));

        return $template->refresh();
    }
}
