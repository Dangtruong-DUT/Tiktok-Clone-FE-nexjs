<?php

namespace App\Services\Analytics\Tools;

use App\Enums\User\RoleTypeEnum;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Top creators ranked by followers, views, or posts.
 */
class TopCreatorsTool extends AbstractAnalyticsTool
{
    /**
     * @return string
     */
    public function name(): string
    {
        return 'get_top_creators';
    }

    /**
     * @return bool
     */
    public function adminOnly(): bool
    {
        return true;
    }

    /**
     * @param  array<string,mixed>  $params
     * @param  int|null  $userId
     * @param  bool      $isAdmin
     * @return array{tool: string, period: string, data: array<string,mixed>, compare: array<string,mixed>|null, change_pct: float|null}
     */
    public function run(array $params, ?int $userId, bool $isAdmin): array
    {
        $range = $this->resolveDateRange((string) ($params['period'] ?? 'current_month'));
        $from  = $range['from'];
        $to    = $range['to'];

        $filters = (array) ($params['filters'] ?? []);
        $sortBy  = (string) ($filters['sort_by'] ?? 'followers');
        $limit   = (int) ($params['limit'] ?? 10);

        // `role` is an int-backed enum (USER=0, SUPER_ADMIN=1) — must compare to int value,
        // not the string label; PostgreSQL will throw a type-mismatch on integer vs string.
        $base = User::query()->where('role', '!=', RoleTypeEnum::SUPER_ADMIN->value);

        if ($sortBy === 'views') {
            // `users` has no total_views column — compute via subquery on posts created in period
            $postStats = DB::table('posts')
                ->selectRaw('user_id, COALESCE(SUM(user_views + guest_views), 0) as total_views')
                ->where('status', 'published')
                ->whereNull('deleted_at')
                ->whereBetween('created_at', [$from, $to])
                ->groupBy('user_id');

            $creators = $base
                ->leftJoinSub($postStats, 'post_stats', 'users.id', '=', 'post_stats.user_id')
                ->orderByDesc(DB::raw('COALESCE(post_stats.total_views, 0)'))
                ->limit($limit)
                ->select([
                    'users.id',
                    'users.uuid',
                    'users.username',
                    'users.followers_count',
                    DB::raw('COALESCE(post_stats.total_views, 0) as total_views'),
                ])
                ->get()
                ->map(fn ($u) => [
                    'user_id'         => $u->id,
                    'uuid'            => $u->uuid,
                    'username'        => $u->username,
                    'followers_count' => (int) $u->followers_count,
                    'total_views'     => (int) $u->total_views,
                ])
                ->toArray();
        } elseif ($sortBy === 'posts') {
            // `users` has no posts_count column — compute via withCount, filtered to period
            $creators = $base
                ->withCount(['posts' => fn ($q) => $q->where('status', 'published')
                    ->whereNull('deleted_at')
                    ->whereBetween('created_at', [$from, $to])])
                ->orderByDesc('posts_count')
                ->limit($limit)
                ->select(['users.id', 'users.uuid', 'users.username', 'users.followers_count'])
                ->get()
                ->map(fn ($u) => [
                    'user_id'         => $u->id,
                    'uuid'            => $u->uuid,
                    'username'        => $u->username,
                    'followers_count' => (int) $u->followers_count,
                    'posts_count'     => (int) $u->posts_count,
                ])
                ->toArray();
        } else {
            // Default: sort by followers_count (cumulative counter — no period filter applicable)
            $creators = $base
                ->orderByDesc('followers_count')
                ->limit($limit)
                ->select(['id', 'uuid', 'username', 'followers_count'])
                ->get()
                ->map(fn ($u) => [
                    'user_id'         => $u->id,
                    'uuid'            => $u->uuid,
                    'username'        => $u->username,
                    'followers_count' => (int) $u->followers_count,
                ])
                ->toArray();
        }

        $creatorIds = array_column($creators, 'user_id');
        if (! empty($creatorIds)) {
            $engagementQuery = DB::table('posts')
                ->whereIn('user_id', $creatorIds)
                ->where('status', 'published')
                ->whereNull('deleted_at');

            if ($sortBy !== 'followers') {
                $engagementQuery->whereBetween('created_at', [$from, $to]);
            }

            $engagementMap = $engagementQuery
                ->selectRaw('user_id, COALESCE(SUM(likes_count + comments_count), 0) as eng, COALESCE(SUM(user_views + guest_views), 0) as views')
                ->groupBy('user_id')
                ->get()
                ->mapWithKeys(fn ($r) => [
                    $r->user_id => $r->views > 0 ? round((float) $r->eng / (float) $r->views * 100, 2) : 0.0,
                ])
                ->toArray();

            $creators = array_map(fn ($c) => array_merge($c, [
                'avg_engagement_rate' => $engagementMap[$c['user_id']] ?? 0.0,
            ]), $creators);
        }

        return [
            'tool'       => $this->name(),
            'period'     => $params['period'],
            'data'       => ['creators' => $creators, 'sort_by' => $sortBy],
            'compare'    => null,
            'change_pct' => null,
        ];
    }
}
