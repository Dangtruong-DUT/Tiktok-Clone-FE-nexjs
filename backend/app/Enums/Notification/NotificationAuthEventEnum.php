<?php

namespace App\Enums\Notification;

enum NotificationAuthEventEnum: string
{
    case LOGIN           = 'login';
    case REGISTER        = 'register';
    case PASSWORD_CHANGE = 'password_change';
    case LOGOUT_ALL      = 'logout_all';
}
