<?php
namespace App\Http\Requests\Upload;

use App\Http\Requests\BaseRequest;

class UploadImageRequest extends BaseRequest
{

    /**
     * Prepare the data for validation.
     *
     * @return void
    */
    protected function prepareForValidation()
    {
        parent::prepareForValidation();

        ;
        $this->merge([
            'file_image' =>$files = $this->file('file'),
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
                'file_image' => [
                    self::REQUIRED
                ],
        ]);
    }
}