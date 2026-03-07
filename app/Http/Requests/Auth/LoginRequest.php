<?php
    namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseRequest;

    class LoginRequest extends BaseRequest
    {
        /**
         * set rules
         *
         * @return array
         */
        protected function rules(): array
        {

            return $this->applyBaseRules([
                'email' => [self::REQUIRED, self::EMAIL],
                'password' => [self::REQUIRED, self::STRING],
            ]);
        }
    }

?>
