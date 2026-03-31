<?php
namespace App\Enums\Notification;
use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;
enum EntityTypeEnum: int implements BaseEnumInterface {
    use BaseEnumTrait;

    case POST = 1;
    case COMMENT = 2;
    case USER = 3;
    case HASHTAG = 4;

    /**
     * Get the label for the entity notify type.
     */
    public function label(): string
    {
        return match($this) {
            self::POST => 'Post',
            self::COMMENT => 'Comment',
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
            self::COMMENT => 'bình luận',
            self::USER => 'người dùng',
            self::HASHTAG => 'hashtag',
        };
    }
}

?>
