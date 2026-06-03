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

    /** @return \Illuminate\Database\Eloquent\Collection<int, AiPromptTemplate> */
    public function allActive()
    {
        return $this->query()->where('is_active', true)->orderBy('intent')->get();
    }

    public function updateTemplate(string $intent, array $data, int $updatedBy): AiPromptTemplate
    {
        $template = $this->query()->where('intent', $intent)->firstOrFail();
        $template->fill($data);
        $template->updated_by = $updatedBy;
        $template->version++;
        $template->save();

        return $template;
    }
}
