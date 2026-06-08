<?php

namespace App\Http\Requests;

use App\Enums\Admin\AdminActionEnum;
use App\Enums\Appeal\AppealStatusEnum;
use App\Enums\Appeal\AppealTypeEnum;
use App\Enums\Common\ResourceTypeEnum;
use App\Enums\Post\AudienceTypeEnum;
use App\Enums\Post\PostTypeEnum;
use App\Enums\User\RoleTypeEnum;
use App\Enums\User\UserVerifyStatusEnum;
use App\Rules\AppealId;
use App\Rules\AppealUuid;
use App\Rules\CommentId;
use App\Rules\CommentUuid;
use App\Rules\NotifyUuid;
use App\Rules\PostUuid;
use App\Rules\UploadFileId;
use App\Rules\UserId;
use App\Rules\UserUuid;
use DateTimeInterface;
use Illuminate\Validation\Rules\Enum;

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

    protected const SOMETIMES = 'sometimes';

    protected const UNIQUE = 'unique';

    protected const UPLOADED = 'uploaded';

    protected const URL = 'url';

    protected const UUID = 'uuid';

    protected const REGEX_PHONE_VN = 'regex:/^[0-9]{10}$/';

    /**
     * shared rules
     */
    protected array $sharedRules = [];

    /**
     * @var array cast rules
     */
    protected array $casts = [];

    /**
     * merge base rules
     */
    protected function applyBaseRules(array $rules): array
    {
        $this->defineBaseRules();

        $mergedRules = [];
        foreach ($rules as $name => $value) {
            $leafName = '';
            if (str_contains($name, '.*.')) {
                $leafName = substr($name, strpos($name, '.*.') + 3);
            }
            if (is_array($value)) {
                $defaultRule = [self::BAIL];
                if ($this->hasBaseRule($name)) {
                    $mergedRules[$name] = array_merge($defaultRule, $value, $this->getBaseRule($name));
                } elseif ($leafName !== '' && $this->hasBaseRule($leafName)) {
                    $mergedRules[$name] = array_merge($defaultRule, $value, $this->getBaseRule($leafName));
                } else {
                    $mergedRules[$name] = array_merge($defaultRule, $value);
                }
            }
        }

        return $mergedRules;
    }

    /**
     * check if common rules exist
     */
    private function hasBaseRule(string $name): bool
    {
        return array_key_exists($name, $this->sharedRules);
    }

    /**
     * find rule from common rules
     */
    private function getBaseRule(string $name): array
    {
        if (array_key_exists($name, $this->sharedRules)) {
            return $this->sharedRules[$name];
        }

        return [];
    }

    /**
     * define base rules
     * If you store common rules in the constructor, the contents of the Request will not be available.
     */
    protected function defineBaseRules(): void
    {
        $this->sharedRules = [
            'email' => [self::EMAIL, self::MAX.':'.'100'],
            'password' => [self::STRING, self::MIN.':'.'8', self::MAX.':'.'100'],
            'confirm_password' => [self::STRING, self::MIN.':'.'8', self::MAX.':'.'100', self::SAME.':password'],
            'user_id' => [self::INTEGER, new UserId],
            'comment_id' => [self::INTEGER, new CommentId],
            'comment_uuid' => [self::STRING, self::UUID, new CommentUuid],
            'user_ids.*' => [self::INTEGER, new UserId],
            'admin_uuid' => [self::STRING, self::UUID, new UserUuid],
            'user_uuid' => [self::STRING, self::UUID, new UserUuid],
            'user_uuids.*' => [self::STRING, self::UUID, new UserUuid],
            'post_uuid' => [self::STRING, self::UUID, new PostUuid],
            'post_uuids.*' => [self::STRING, self::UUID, new PostUuid],
            'date_of_birth' => [self::DATE],
            'name' => [self::STRING, self::MAX.':'.'100'],
            'role' => [new Enum(RoleTypeEnum::class)],
            'verify_status' => [new Enum(UserVerifyStatusEnum::class)],
            'username' => [self::STRING, 'regex:'.config('regex.username_validation')],
            'phone' => [self::STRING, self::MAX.':'.'100'],
            'month' => [self::INTEGER, self::MIN.':'.'1', self::MAX.':'.'12'],
            'year' => [self::INTEGER, self::MIN.':'.'1900', self::MAX.':'.'2100'],
            'bio' => [self::STRING, self::MAX.':255'],
            'location' => [self::STRING, self::MAX.':100'],
            'website' => [self::STRING, self::URL],
            'avatar_file_id' => [self::INTEGER, new UploadFileId],
            'days' => [self::NUMERIC, self::MIN.':'.'0'],
            'created_at' => [self::DATE_FORMAT.':'.DateTimeInterface::ATOM],
            'updated_at' => [self::DATE_FORMAT.':'.DateTimeInterface::ATOM],
            'file_image' => [
                self::FILE,
                self::MAX.':'.config('const.file.image.max_size_kb', 10240),
                self::MIMES.':'.config('const.file.image.mimes', 'jpg,jpeg,png'),
            ],
            'file_images.*' => [
                self::FILE,
                self::MAX.':'.config('const.file.image.max_size_kb', 10240),
                self::MIMES.':'.config('const.file.image.mimes', 'jpg,jpeg,png'),
            ],
            'file_video' => [
                self::FILE,
                self::MAX.':'.config('const.file.video.max_size_kb', 51200),
                self::MIMES.':'.config('const.file.video.mimes', 'mp4,mov'),
            ],
            'file_videos.*' => [
                self::FILE,
                self::MAX.':'.config('const.file.video.max_size_kb', 51200),
                self::MIMES.':'.config('const.file.video.mimes', 'mp4,mov'),
            ],
            'audience' => [ new Enum(AudienceTypeEnum::class) ],
            'post_type' => [new Enum(PostTypeEnum::class)],
            'notification_uuid' => [self::STRING, self::UUID, new NotifyUuid],
            'action_type' => [new Enum(AdminActionEnum::class)],
            'resource_id' => [self::INTEGER],
            'resource_type' => [
                new Enum(ResourceTypeEnum::class)],
            'appeal_id' => [self::INTEGER, new AppealId],
            'appeal_uuid' => [self::STRING, self::UUID, new AppealUuid],
            'appeal_type' => [
                new Enum(AppealTypeEnum::class)],
            'appeal_status' => [
                new Enum(AppealStatusEnum::class)],
            'date_from'    => [self::NULLABLE, self::DATE_FORMAT.':Y-m-d'],
            'date_to'      => [self::NULLABLE, self::DATE_FORMAT.':Y-m-d'],
            'scheduled_at' => [self::DATE, self::AFTER.':now'],
            'timezone'     => [self::NULLABLE, self::STRING, self::MAX.':100'],
        ];
    }
}
