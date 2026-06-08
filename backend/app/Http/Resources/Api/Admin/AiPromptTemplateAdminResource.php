<?php

namespace App\Http\Resources\Api\Admin;

use App\Http\Resources\BaseJsonResource;
use Illuminate\Http\Request;

class AiPromptTemplateAdminResource extends BaseJsonResource
{
    /**
     * @return array<string,mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'intent'             => $this->intent,
            'category'           => $this->category,
            'display_name'       => $this->display_name,
            'system_prompt'      => $this->system_prompt,
            'user_template'      => $this->user_template,
            'few_shot_examples'  => $this->few_shot_examples,
            'is_active'          => (bool) $this->is_active,
            'is_locked'          => (bool) $this->is_locked,
            'version'            => $this->version,
        ];
    }
}
