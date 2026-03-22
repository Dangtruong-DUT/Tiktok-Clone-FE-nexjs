<?php
namespace App\Http\Requests\Post;

use App\Http\Requests\BaseListRequest;

class GetPostsOfUserRequest extends BaseListRequest
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
     * set rules
     *
     * @return array
     */
    public function rules(): array
    {

        return $this->applyBaseRules([
                'user_uuid'=>[
                    self::REQUIRED
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
}
