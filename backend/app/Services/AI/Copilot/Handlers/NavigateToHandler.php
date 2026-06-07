<?php

namespace App\Services\AI\Copilot\Handlers;

use App\Contracts\AI\GeminiClientInterface;
use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\AppRouteInfo;
use App\DTOs\AI\CopilotHandlerResult;
use App\Enums\Ai\AiCopilotIntentEnum;
use App\Models\AiPromptTemplate;

/**
 * Returns a nav_card with relevant app routes based on the user's query.
 * No Gemini call, no DB access — pure keyword→route mapping.
 */
class NavigateToHandler extends AbstractCopilotHandler implements CopilotHandlerInterface
{
    /**
     * Route map: each entry is [keywords[], AppRouteInfo].
     * Paths are locale-agnostic (e.g. /snapistudio/upload).
     * The frontend prepends /[locale] automatically via next-intl Link.
     */
    private const ROUTE_MAP = [
        [
            'keywords'    => ['upload', 'đăng video', 'tải lên', 'tải video', 'đăng bài mới', 'quay video'],
            'label'       => 'Đăng video mới',
            'path'        => '/snapistudio/upload',
            'description' => 'Tải lên và chỉnh sửa video mới của bạn',
        ],
        [
            'keywords'    => ['lịch đăng', 'scheduled', 'bài đã lên lịch', 'lên lịch', 'thời gian đăng'],
            'label'       => 'Bài đăng đã lên lịch',
            'path'        => '/snapistudio/scheduled-posts',
            'description' => 'Xem và quản lý các bài đăng đã lên lịch',
        ],
        [
            'keywords'    => ['bài đăng', 'content', 'nội dung', 'quản lý bài', 'my posts', 'danh sách bài'],
            'label'       => 'Quản lý bài đăng',
            'path'        => '/snapistudio/content',
            'description' => 'Xem toàn bộ bài đăng của bạn (đã đăng, nháp, thất bại)',
        ],
        [
            'keywords'    => ['wellness', 'screen time', 'thời gian sử dụng', 'sức khoẻ số', 'giới hạn'],
            'label'       => 'Wellness & Screen Time',
            'path'        => '/snapistudio/wellness',
            'description' => 'Theo dõi thời gian sử dụng và thiết lập giới hạn lành mạnh',
        ],
        [
            'keywords'    => ['cài đặt', 'settings', 'hồ sơ', 'tài khoản', 'profile', 'đổi mật khẩu'],
            'label'       => 'Cài đặt tài khoản',
            'path'        => '/snapistudio/settings',
            'description' => 'Chỉnh sửa hồ sơ, mật khẩu và tuỳ chọn bảo mật',
        ],
        [
            'keywords'    => ['khiếu nại', 'appeals', 'kháng cáo', 'report', 'vi phạm'],
            'label'       => 'Khiếu nại kiểm duyệt',
            'path'        => '/snapistudio/appeals',
            'description' => 'Gửi và theo dõi khiếu nại về các quyết định kiểm duyệt',
        ],
        [
            'keywords'    => ['trang chủ', 'home', 'snapi studio', 'dashboard', 'tổng quan'],
            'label'       => 'Tổng quan Snapi Studio',
            'path'        => '/snapistudio',
            'description' => 'Trang tổng quan Snapi Studio của bạn',
        ],
    ];

    public function __construct(GeminiClientInterface $gemini)
    {
        parent::__construct($gemini);
    }

    public function handle(
        AiCopilotIntentEnum     $intent,
        AiCopilotMessageInput   $input,
        AiCopilotSessionContext $context,
        AiPromptTemplate        $template,
        array                   $conversationHistory,
    ): CopilotHandlerResult {
        $msg     = mb_strtolower($input->content);
        $matched = $this->matchRoutes($msg);

        if (empty($matched)) {
            // Return all routes as a general navigation guide
            $matched = array_map(
                fn (array $r) => new AppRouteInfo($r['label'], $r['path'], $r['description']),
                self::ROUTE_MAP,
            );
            $intro = 'Dưới đây là tất cả các trang trong Snapi Studio:';
        } else {
            $intro = 'Tìm thấy trang phù hợp với yêu cầu của bạn:';
        }

        return new CopilotHandlerResult(
            text:             $intro,
            structuredOutput: [
                'type'   => 'nav_card',
                'routes' => array_map(fn (AppRouteInfo $r) => $r->toArray(), $matched),
            ],
            followUpChips: ['Đăng video mới', 'Xem bài đăng của tôi', 'Cài đặt tài khoản'],
        );
    }

    /** @return AppRouteInfo[] */
    private function matchRoutes(string $message): array
    {
        $matched = [];

        foreach (self::ROUTE_MAP as $entry) {
            foreach ($entry['keywords'] as $kw) {
                if (str_contains($message, mb_strtolower($kw))) {
                    $matched[] = new AppRouteInfo($entry['label'], $entry['path'], $entry['description']);
                    break;
                }
            }
        }

        return $matched;
    }
}
