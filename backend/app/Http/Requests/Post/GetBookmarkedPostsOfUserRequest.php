<?php

namespace App\Http\Requests\Post;

use App\Http\Requests\BaseListRequest;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

class GetBookmarkedPostsOfUserRequest extends BaseListRequest
{
    protected function prepareForValidation(): void
    {
        $needMerge = [
            'user_uuid' => $this->route('user_uuid'),
        ];

        if ($this->has('type')) {
            $needMerge['post_type'] = $this->query('type');
        }
        $this->merge($needMerge);
    }

    /**
     * Determine if the user is authorized to make this request.
 */
    public function authorize(): bool
    {
        return Gate::allows('viewBookmarkedVideos', $this->getTargetUser());
    }

    /**
     * set rules
 */
    public function rules(): array
    {

        return $this->applyBaseRules([
            'user_uuid' => [
                self::REQUIRED,
            ],
            'post_type' => [
                self::SOMETIMES,
                self::REQUIRED,
            ],
            'page' => [
                self::SOMETIMES,
                self::REQUIRED,
            ],
            'per_page' => [
                self::SOMETIMES,
                self::REQUIRED,
            ],
        ]);
    }

    /**
     * Get the target user based on the route parameter.
 */
    private function getTargetUser(): User
    {
        return User::where('uuid', $this->route('user_uuid'))->firstOrFail();
    }
}
