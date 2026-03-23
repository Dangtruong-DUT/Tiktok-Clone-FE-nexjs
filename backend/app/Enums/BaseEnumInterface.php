<?php

namespace App\Enums;

interface BaseEnumInterface
{
    /**
     * Get all the values of the enum.
     *
     * @return array
     */
    public static function values(): array;

    /**
     * Get all the labels of the enum.
     *
     * @return array
     */
    public static function labels(): array;

    /**
     * Get the label of the enum value.
     *
     * @return string
     */
    public function label(): string;

    /**
     * Get the translated label of the enum value.
     *
     * @return string
     */

    public function translate(): string;

}
