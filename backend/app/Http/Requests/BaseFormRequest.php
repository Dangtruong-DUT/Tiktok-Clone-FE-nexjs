<?php

namespace App\Http\Requests;

use App\Support\ArrayKeyFormatter;
use App\Support\DataCaster;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;

abstract class BaseFormRequest extends FormRequest
{
    /**
     * @var array casts
     */
    protected array $casts = [];


    /*
    * prepare for validation: convert keys to snake case
    * @return void
    */
    protected function prepareForValidation()
    {
        $validationData = parent::validationData();
        $this->replace(ArrayKeyFormatter::toSnakeCase($validationData));
    }

    /**
     * override validated for cast data after validation
     *
     * @param null|mixed $key
     * @param null|mixed $default
     * @throws ValidationException
     */
    public function validated($key = null, $default = null): mixed
    {
        if ($key !== null) {
            return parent::validated($key, $default);
        }

        $validatedData = parent::validated();
        if (empty($this->casts)) {
            return $validatedData;
        }
        return DataCaster::nestedCast($validatedData, $this->casts);
    }
}