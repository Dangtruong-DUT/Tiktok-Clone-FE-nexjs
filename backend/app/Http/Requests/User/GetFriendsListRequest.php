<?php
namespace App\Http\Requests\User;

use App\Http\Requests\BaseListRequest;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

class GetFriendsListRequest extends BaseListRequest
{

    protected function prepareForValidation()
    {
        parent::prepareForValidation();
        $this->merge([
            'user_uuid' => $this->route('user_uuid'),
        ]);
    }

    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return Gate::allows('viewFriends', $this->getTargetUser());
    }


    /**
     * set rules
     *
     * @return array
     */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'user_uuid' => [
                self::REQUIRED,
            ],
            'q' => [
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
     *
     * @return User
     */
    private function getTargetUser(): User
    {
        return User::where('uuid', $this->route('user_uuid'))->firstOrFail();
    }
}
