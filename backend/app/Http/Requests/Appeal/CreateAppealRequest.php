<?php

namespace App\Http\Requests\Appeal;

use App\Enums\Admin\AdminResourceEnum;
use App\Enums\Appeal\AppealTypeEnum;
use App\Models\AiModerationReport;
use Illuminate\Validation\Validator;

/**
 * CreateAppealRequest - User files an appeal for ban/hidden/deleted content
 */
class CreateAppealRequest extends BaseAppealRequest
{
    /**
     * Get the validation rules.
     * @return array<string, string|array>
     */
    public function rules(): array
    {
        return [
            'appeal_type' => ['required', 'in:' . implode(',', array_map(fn($e) => $e->value, AppealTypeEnum::cases()))],
            'resource_id' => ['nullable', 'integer'],
            'resource_type' => ['required', 'string', 'in:' . implode(',', AdminResourceEnum::appealValues())],
            'reason' => ['required', 'string', 'min:20', 'max:1000'],
        ];
    }

    /**
     * Get custom messages for validation errors
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'appeal_type.required' => 'Appeal type is required',
            'appeal_type.in' => 'Invalid appeal type',
            'resource_type.required' => 'Resource type is required',
            'reason.required' => 'Appeal reason is required',
            'reason.min' => 'Appeal reason must be at least 20 characters',
        ];
    }

    /**
     * Attach additional validation for AI moderation appeal window.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $resourceType = (string) $this->input('resource_type');
            if (!in_array($resourceType, [AdminResourceEnum::POST->value, AdminResourceEnum::COMMENT->value], true)) {
                return;
            }

            $resourceId = (int) $this->input('resource_id', 0);
            if ($resourceId <= 0) {
                return;
            }

            $report = AiModerationReport::query()
                ->where('resource_type', $resourceType)
                ->where('resource_id', $resourceId)
                ->latest('id')
                ->first();

            if (!$report) {
                $validator->errors()->add('resource_id', 'No moderation report found for this resource.');
                return;
            }

            if ((int) $report->user_id !== (int) auth_user_id()) {
                $validator->errors()->add('resource_id', 'You are not allowed to appeal this moderation action.');
                return;
            }

            if ($report->appeal_deadline_at !== null && now()->greaterThan($report->appeal_deadline_at)) {
                $validator->errors()->add('resource_id', 'Appeal period has expired (7 days).');
            }
        });
    }
}
