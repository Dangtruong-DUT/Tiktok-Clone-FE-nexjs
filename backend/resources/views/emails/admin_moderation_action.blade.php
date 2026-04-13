<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Moderation Notice</title>
    <style>
        .mail { margin: 0; background: #edf2f7; font-family: Arial, sans-serif; }
        .mail__wrapper { width: 100%; padding: 28px 14px; }
        .mail__container { width: 560px; max-width: 100%; margin: 0 auto; background: #ffffff; border: 1px solid #d9e3f0; border-radius: 8px; overflow: hidden; }
        .mail__header { padding: 20px 32px 0; color: #102542; font-size: 13px; font-weight: 700; }
        .mail__body { padding: 20px 32px 28px; color: #223046; font-size: 14px; line-height: 1.65; }
        .mail__title { font-size: 24px; line-height: 1.25; font-weight: 700; margin: 0 0 16px; color: #102542; }
        .mail__text { margin: 10px 0; }
        .mail__notice { margin-top: 14px; background: #f8fbff; border: 1px solid #d7e4f8; border-radius: 10px; padding: 12px 14px; color: #284870; font-size: 13px; }
        .mail__button-wrapper { margin: 24px 0; text-align: center; }
        .mail__button { display: inline-block; padding: 12px 22px; background: #102542; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; border-radius: 6px; letter-spacing: 0.2px; }
        .mail__footer { padding: 16px 32px 20px; font-size: 12px; color: #7b8aa0; border-top: 1px solid #e5edf7; text-align: center; }
        @media only screen and (max-width: 600px) {
            .mail__header, .mail__body, .mail__footer { padding-left: 20px !important; padding-right: 20px !important; }
        }
    </style>
</head>
<body class="mail">
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" class="mail__wrapper">
    <table class="mail__container" cellpadding="0" cellspacing="0">
        <tr>
            <td class="mail__header">{{ $appName }}</td>
        </tr>
        <tr>
            <td class="mail__body">
                <div class="mail__title">Account Moderation Notice</div>

                <p class="mail__text" style="margin-top:0;">Hello {{ $targetUserName }},</p>

                <p class="mail__text">
                    An admin (<strong>{{ $adminName }}</strong>) has taken the action <strong>{{ $actionLabel }}</strong> on your account/content.
                </p>

                <div class="mail__notice">
                    <strong>Reason:</strong> {{ $reason }}
                </div>

                @if(!empty($appealLink))
                    <p class="mail__text">
                        If you believe this action was incorrect, you can submit an appeal.
                    </p>

                    <div class="mail__button-wrapper">
                        <a href="{{ $appealLink }}" class="mail__button" target="_blank">Submit Appeal</a>
                    </div>

                    <p class="mail__text" style="font-size:12px;color:#51657f;word-break:break-all;">
                        Appeal link: {{ $appealLink }}
                    </p>
                @endif
            </td>
        </tr>
        <tr>
            <td class="mail__footer">&copy; {{ date('Y') }} {{ $appName }}. All rights reserved.</td>
        </tr>
    </table>
</td>
</tr>
</table>
</body>
</html>
