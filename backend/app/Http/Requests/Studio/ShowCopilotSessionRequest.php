<?php

namespace App\Http\Requests\Studio;

use App\Http\Requests\BaseRequest;

class ShowCopilotSessionRequest extends BaseRequest
{
    protected function prepareForValidation()
    {
        parent::prepareForValidation();
        $this->merge(['uuid' => $this->route('uuid')]);
    }

    /** @return array<string,mixed> */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'uuid' => [self::REQUIRED, self::UUID],
        ]);
    }
}
