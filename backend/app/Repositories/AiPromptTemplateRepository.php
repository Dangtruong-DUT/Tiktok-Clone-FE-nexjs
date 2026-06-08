<?php

namespace App\Repositories;

use App\Models\AiPromptTemplate;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends BaseRepository<AiPromptTemplate>
 */
class AiPromptTemplateRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(app()->make(AiPromptTemplate::class));
    }

    /**
     * Find an active prompt template by intent.
     *
     * @param  string  $intent
     * @return AiPromptTemplate|null
     */
    public function findByIntent(string $intent): ?AiPromptTemplate
    {
        /** @var AiPromptTemplate|null */
        return $this->query()
            ->where('intent', $intent)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Find a prompt template by intent regardless of active state.
     *
     * @param  string  $intent
     * @return AiPromptTemplate|null
     */
    public function findByIntentAny(string $intent): ?AiPromptTemplate
    {
        /** @var AiPromptTemplate|null */
        return $this->query()->where('intent', $intent)->first();
    }

    /**
     * Get all active prompt templates ordered by intent.
     *
     * @return \Illuminate\Database\Eloquent\Collection<int, AiPromptTemplate>
     */
    public function allActive(): Collection
    {
        return $this->query()->where('is_active', true)->orderBy('intent')->get();
    }

    /**
     * Update a prompt template by intent.
     *
     * @param  string  $intent
     * @param  array<string, mixed>  $data
     * @param  int  $updatedBy
     * @return AiPromptTemplate
     */
    public function updateByIntent(string $intent, array $data, int $updatedBy): AiPromptTemplate
    {
        /** @var AiPromptTemplate */
        $template = $this->query()->where('intent', $intent)->firstOrFail();
        $this->query()->whereKey($template->id)->update(array_merge($data, [
            'updated_by' => $updatedBy,
            'version'    => $template->version + 1,
        ]));

        return $template->refresh();
    }

    /**
     * Lock or unlock a prompt template by intent.
     *
     * @param  string  $intent
     * @param  bool  $locked
     * @return AiPromptTemplate
     */
    public function setLockedByIntent(string $intent, bool $locked): AiPromptTemplate
    {
        /** @var AiPromptTemplate */
        $template = $this->query()->where('intent', $intent)->firstOrFail();
        $this->query()->whereKey($template->id)->update(['is_locked' => $locked]);

        return $template->refresh();
    }
}
