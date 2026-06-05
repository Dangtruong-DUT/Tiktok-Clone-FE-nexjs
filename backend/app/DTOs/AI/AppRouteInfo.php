<?php

namespace App\DTOs\AI;

final readonly class AppRouteInfo
{
    public function __construct(
        public string $label,
        public string $path,
        public string $description,
    ) {}

    public function toArray(): array
    {
        return [
            'label'       => $this->label,
            'path'        => $this->path,
            'description' => $this->description,
        ];
    }
}
