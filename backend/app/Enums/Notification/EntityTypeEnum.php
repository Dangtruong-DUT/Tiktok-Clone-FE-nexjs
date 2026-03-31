<?php
namespace App\Enums\Notification;
use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;
enum EntityTypeEnum: int implements BaseEnumInterface {
    use BaseEnumTrait;

    case POST = 'post';
    case USER = 'user';
    case HASHTAG = 'hashtag';

    /**
     * Get the label for the entity notify type.
     */
    public function label(): string
    {
        return match($this) {
            self::POST => 'Post',
            self::USER => 'User',
            self::HASHTAG => 'Hashtag',
        };
    }

    /**
     * Get the translated label for the entity notify type.
     */
    public function translate(): string
    {
        return match($this) {
            self::POST => 'bài viết',
            self::USER => 'người dùng',
            self::HASHTAG => 'hashtag',
        };
    }
}

?>
