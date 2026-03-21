<?php
namespace App\Http\Requests\Post;

use App\Http\Requests\BaseListRequest;

class GetListPostRequest extends BaseListRequest
{
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();
        $this->merge([
            'post_type' => $this->query('type'),
        ]);
    }

    /**
     * set rules
     *
     * @return array
     */
    public function rules(): array
    {
        return $this->applyBaseRules([
                'q'=> [
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
                'audience' => [
                    self::SOMETIMES,
                    self::REQUIRED,
                ],
                'post_type' => [
                    self::REQUIRED,
                ],

        ]);
    }
}
