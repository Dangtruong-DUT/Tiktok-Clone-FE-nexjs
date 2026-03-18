<?php

namespace App\Enums;

interface BaseEnumInterface
{
    public static function values(): array;

    public static function labels(): array;

    public function label(): string;

    public function translate(): string;

}