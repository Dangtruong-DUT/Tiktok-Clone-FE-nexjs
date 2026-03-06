<?php

namespace App\Http\Requests;

use App\Rules\UserId;
use DateTimeInterface;

abstract class BaseRequest extends BaseFormRequest
{
    /*
     * Laravel standard validation rules
     */
    protected const ACCEPTED = 'accepted';
    protected const ACTIVE_URL = 'active_url';
    protected const AFTER = 'after';
    protected const AFTER_OR_EQUAL = 'after_or_equal';
    protected const ALPHA = 'alpha';
    protected const ALPHA_DASH = 'alpha_dash';
    protected const ALPHA_NUM = 'alpha_num';
    protected const ARRAY = 'array';
    protected const BAIL = 'bail';
    protected const BEFORE = 'before';
    protected const BEFORE_OR_EQUAL = 'before_or_equal';
    protected const BETWEEN = 'between';
    protected const BOOLEAN = 'boolean';
    protected const CONFIRMED = 'confirmed';
    protected const DATE = 'date';
    protected const DATE_EQUALS = 'date_equals';
    protected const DATE_FORMAT = 'date_format';
    protected const DIFFERENT = 'different';
    protected const DIGITS = 'digits';
    protected const DIGITS_BETWEEN = 'digits_between';
    protected const DIMENSIONS = 'dimensions';
    protected const DISTINCT = 'distinct';
    protected const EMAIL = 'email';
    protected const ENDS_WITH = 'ends_with';
    protected const EXCLUDE_IF = 'exclude_if';
    protected const EXCLUDE_UNLESS = 'exclude_unless';
    protected const EXISTS = 'exists';
    protected const FILE = 'file';
    protected const FILLED = 'filled';
    protected const GT = 'gt';
    protected const GTE = 'gte';
    protected const IMAGE = 'image';
    protected const IN = 'in';
    protected const IN_ARRAY = 'in_array';
    protected const INTEGER = 'integer';
    protected const IP = 'ip';
    protected const IPV4 = 'ipv4';
    protected const IPV6 = 'ipv6';
    protected const JSON = 'json';
    protected const LT = 'lt';
    protected const LTE = 'lte';
    protected const MAX = 'max';
    protected const MIMES = 'mimes';
    protected const MIMETYPES = 'mimetypes';
    protected const MIN = 'min';
    protected const MULTIPLE_OF = 'multiple_of';
    protected const NOT_IN = 'not_in';
    protected const NOT_REGEX = 'not_regex';
    protected const NULLABLE = 'nullable';
    protected const NUMERIC = 'numeric';
    protected const CURRENT_PASSWORD = 'current_password';
    protected const PRESENT = 'present';
    protected const PROHIBITED = 'prohibited';
    protected const PROHIBITED_IF = 'prohibited_if';
    protected const PROHIBITED_UNLESS = 'prohibited_unless';
    protected const PROHIBITS = 'prohibits';
    protected const REGEX = 'regex';
    protected const REQUIRED = 'required';
    protected const REQUIRED_IF = 'required_if';
    protected const REQUIRED_WITH = 'required_with';
    protected const REQUIRED_WITH_ALL = 'required_with_all';
    protected const REQUIRED_WITHOUT = 'required_without';
    protected const REQUIRED_WITHOUT_ALL = 'required_without_all';
    protected const SAME = 'same';
    protected const SIZE = 'size';
    protected const STARTS_WITH = 'starts_with';
    protected const STRING = 'string';
    protected const TIMEZONE = 'timezone';
    protected const UNIQUE = 'unique';
    protected const UPLOADED = 'uploaded';
    protected const URL = 'url';
    protected const UUID = 'uuid';
    protected const REGEX_PHONE_VN = 'regex:/^[0-9]{10}$/';

    /**
     * common rules
     */
    protected array $commonRules;

    /**
     * @var array cast rules
     */
    protected array $casts = [];

    /**
     * validation data
     */
    public function validationData(): array
    {
        $validationData = parent::validationData();

        // Convert string "null" to actual null for all inputs
        array_walk_recursive($validationData, function (&$value) {
            if ($value === 'null') {
                $value = null;
            }
        });

        // Also update invoke the request input modification so other methods see the change
        foreach ($validationData as $key => $value) {
            if ($this->input($key) === 'null') {
                $this->merge([$key => null]);
            }
        }

        if ($this->has('order_by')) {
            $validationData['order_by'] = $this->castValueOfOrderBy($this->get('order_by'));
        }

        if ($this->has('attachments')) {
            // $validationData['attachments'] = $this->castValueOfAttachments($this->get('attachments'));
        }

        return $validationData;
    }

    /**
     * merge common rules
     *
     * @param array $rules
     * @return array
     */
    protected function mergeCommonRules(array $rules): array
    {
        // If you store it in the constructor, the contents of the Request will not be available, so store it here.
        $this->setCommonRules();

        $mergedRules = [];
        foreach ($rules as $name => $value) {
            $leafName = '';
            if (str_contains($name, '*')) {
                // if the item is nested, use the last item as the common target (hoge.*.fuga)
                $leafName = strstr($name, '.*.');
            }
            if (is_array($value)) {
                // set common rules for all items
                $default = [self::BAIL];
                // if the array, merge the array
                if ($this->existsCommonRules($name)) {
                    $mergedRules[$name] = array_merge($default, $value, $this->findCommonRules($name));
                } elseif ($leafName !== '' && $this->existsCommonRules($leafName)) {
                    $mergedRules[$name] = array_merge($default, $value, $this->findCommonRules($leafName));
                } else {
                    $mergedRules[$name] = array_merge($default, $value);
                }
            }
        }
        return $mergedRules;
    }

    /**
     * Summary of castValueOfOrderBy
     * @param array $orderBy
     * @return array
     */
    private function castValueOfOrderBy(array $orderBy): array
    {
        return array_map(function ($item) {
            // cast column and direction column in database field
            return $item;
        }, $orderBy);
    }

    /**
     * check if common rules exist
     *
     * @param string $name
     * @return bool
     */
    private function existsCommonRules(string $name): bool
    {
        return array_key_exists($name, $this->commonRules);
    }

    /**
     * find rule from common rules
     *
     * @param string $name
     * @return array
     */
    private function findCommonRules(string $name): array
    {
        if (array_key_exists($name, $this->commonRules)) {
            return $this->commonRules[$name];
        }
        return [];
    }

    /**
     * set common rules
     * @param void
     * @return void
     */
    protected function setCommonRules(): void
    {
        $this->commonRules = [
            'email' => [self::EMAIL, self::MAX.':'.'100'],
            'password' => [self::STRING, self::MIN.':'.'8'],
            'user_id' => [self::INTEGER, new UserId()],
            'user_ids.*' => [self::INTEGER, new UserId()],
            'full_name' => [self::STRING, self::MAX.':'.'100'],
            'phone' => [self::STRING, self::MAX.':'.'100'],
            'id_card_number' => [self::STRING, self::MAX.':'.'100'],
            'month' => [self::INTEGER, self::MIN.':'.'1', self::MAX.':'.'12'],
            'year' => [self::INTEGER, self::MIN.':'.'1900', self::MAX.':'.'2100'],
            'keyword' => [self::STRING, self::MAX.':'.'100'],
            'days' => [self::NUMERIC, self::MIN.':'.'0'],
            'search' => [self::STRING, self::MAX.':'.'100'],
            'created_at' => [self::DATE_FORMAT . ':' . DateTimeInterface::ATOM],
            'updated_at' => [self::DATE_FORMAT . ':' . DateTimeInterface::ATOM],
            'per_page' => [self::INTEGER, self::MIN.':'.'1', self::MAX.':'.'100'],
            'order_by' => [self::ARRAY],
            'order_by.*.column' => [self::STRING],
            'order_by.*.direction' => [self::STRING],
        ];
    }
}
