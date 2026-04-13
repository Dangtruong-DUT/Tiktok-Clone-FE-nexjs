<?php

namespace App\Http\Requests\Admin\Appeal;

use App\Http\Requests\Admin\BaseAdminRequest;

/**
 * ApproveAppealRequest - Admin approves an appeal
 */
class ApproveAppealRequest extends BaseAdminRequest
{
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $this->merge([
            'appeal_id' => $this->route('appeal_id'),
        ]);
    }

    /**
     * Get the validation rules.
     * @return array<string, string|array>
     */
    public function rules(): array
    {
        return [
            'appeal_id' => ['required', 'integer', 'exists:appeals,id'],
            'admin_response' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Get custom messages.
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'appeal_id.required' => 'Appeal ID is required',
            'appeal_id.exists' => 'The selected appeal does not exist',
            'admin_response.max' => 'Response cannot exceed 500 characters',
        ];
    }
}
