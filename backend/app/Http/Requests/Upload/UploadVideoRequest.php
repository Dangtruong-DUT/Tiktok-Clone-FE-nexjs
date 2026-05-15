<?php

namespace App\Http\Requests\Upload;

use App\Http\Requests\BaseRequest;

class UploadVideoRequest extends BaseRequest
{
    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation()
    {
        parent::prepareForValidation();

        $this->merge([
            'file_video' => $this->file('file'),
        ]);
    }

    /**
     * set rules
     */
    public function rules(): array
    {

        return $this->applyBaseRules([
            'file_video' => [
                self::REQUIRED,
            ],
        ]);
    }
}
