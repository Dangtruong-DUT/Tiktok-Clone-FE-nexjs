<?php

namespace App\Http\Requests;

use DateTimeInterface;

abstract class BaseListRequest extends BaseRequest
{
    /**
     * @var array casts
 */
    protected array $casts = [
        'limit' => 'integer',
        'offset' => 'integer',
        'page' => 'integer',
        'per_page' => 'integer',
    ];

    /**
     * set common rules
 */
    protected function defineBaseRules(): void
    {
        parent::defineBaseRules();

        $this->sharedRules = array_merge($this->sharedRules, [
            'q' => [self::STRING, self::MAX.':'.'100'],
            'created_date_from' => [self::DATE_FORMAT.':'.DateTimeInterface::ATOM],
            'created_date_to' => [self::DATE_FORMAT.':'.DateTimeInterface::ATOM],
            'page' => [
                self::INTEGER,
                self::MIN.':'.config('const.pagination.min_page', 1),
            ],
            'per_page' => [
                self::INTEGER,
                self::MIN.':'.config('const.pagination.min_per_page', 1),
                self::MAX.':'.config('const.pagination.max_per_page', 100),
            ],
            'order_by' => [self::ARRAY],
            'order_by.*.column' => [self::STRING],
            'order_by.*.direction' => [self::STRING],
        ]);
    }

    /**
     * prepare for validation: remove null values
     *
     * @return void
 */
    protected function prepareForValidation()
    {
        parent::prepareForValidation();
        $validationData = parent::validationData();
        foreach ($validationData as $key => $value) {
            if ((empty($value) || $value === 'null') && $value !== 0 && $value !== '0') {
                unset($validationData[$key]);
            }
        }
        $this->replace($validationData);
    }

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
        $this->merge($validationData);

        if ($this->has('order_by')) {
            $validationData['order_by'] = $this->castValueOfOrderBy($this->input('order_by'));
        }

        return $validationData;
    }

    /**
     * cast column and direction column in database field
 */
    private function castValueOfOrderBy(array $orderBy): array
    {
        return array_map(function ($item) {
            return $item;
        }, $orderBy);
    }
}
