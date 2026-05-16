<?php

namespace App\Providers;

use App\Events\Admin\AdminDirectMessageSentEvent;
use App\Events\Admin\AdminActionLoggedEvent;
use App\Events\Admin\AdminModerationActionNotifiedEvent;
use App\Events\Admin\AdminPositiveActionNotifiedEvent;
use App\Events\Auth\UserEmailVerificationRequestedEvent;
use App\Events\Auth\UserEmailVerifiedEvent;
use App\Events\Auth\UserPasswordResetRequestedEvent;
use App\Events\Social\PostCommentedEvent;
use App\Events\Social\PostLikedEvent;
use App\Events\Social\UserFollowedEvent;
use App\Events\Social\UserMentionedEvent;
use App\Listeners\Admin\NotifyModerationActionListener;
use App\Listeners\Admin\NotifyPositiveActionListener;
use App\Listeners\Admin\CreateAdminLogListener;
use App\Listeners\Admin\CreateAdminLogFromNotificationListener;
use App\Listeners\Admin\SendDirectMessageEmailListener;
use App\Listeners\Admin\SendModerationEmailListener;
use App\Listeners\Admin\SendPositiveActionEmailListener;
use App\Listeners\Auth\SendPasswordResetEmailListener;
use App\Listeners\Auth\SendVerifyEmailListener;
use App\Listeners\Auth\SendVerifySuccessEmailListener;
use App\Listeners\Social\CreateCommentNotificationListener;
use App\Listeners\Social\CreateFollowNotificationListener;
use App\Listeners\Social\CreateLikeNotificationListener;
use App\Listeners\Social\CreateMentionNotificationsListener;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        UserEmailVerificationRequestedEvent::class => [
            SendVerifyEmailListener::class,
        ],
        UserEmailVerifiedEvent::class => [
            SendVerifySuccessEmailListener::class,
        ],
        UserPasswordResetRequestedEvent::class => [
            SendPasswordResetEmailListener::class,
        ],
        UserFollowedEvent::class => [
            CreateFollowNotificationListener::class,
        ],
        PostLikedEvent::class => [
            CreateLikeNotificationListener::class,
        ],
        PostCommentedEvent::class => [
            CreateCommentNotificationListener::class,
        ],
        UserMentionedEvent::class => [
            CreateMentionNotificationsListener::class,
        ],
        AdminModerationActionNotifiedEvent::class => [
            NotifyModerationActionListener::class,
            SendModerationEmailListener::class,
            CreateAdminLogFromNotificationListener::class,
        ],
        AdminPositiveActionNotifiedEvent::class => [
            NotifyPositiveActionListener::class,
            SendPositiveActionEmailListener::class,
            CreateAdminLogFromNotificationListener::class,
        ],
        AdminDirectMessageSentEvent::class => [
            SendDirectMessageEmailListener::class,
        ],
        AdminActionLoggedEvent::class => [
            CreateAdminLogListener::class,
        ],
    ];
}
