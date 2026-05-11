<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Notice</title>

    <style>
        .mail { margin: 0; background: #f5f5f5; font-family: Arial, sans-serif; }
        .mail__wrapper { width: 100%; padding: 28px 14px; }
        .mail__container {
            width: 560px; max-width: 100%; margin: 0 auto;
            background: #ffffff; border: 1px solid #e0e0e0;
        }
        .mail__header { padding: 20px 32px 0; color: #000000; font-size: 13px; font-weight: 700; }
        .mail__body { padding: 20px 32px 28px; color: #333333; font-size: 14px; line-height: 1.65; }
        .mail__title { font-size: 24px; line-height: 1.25; font-weight: 700; margin: 0 0 16px; color: #000000; }
        .mail__text { margin: 10px 0; }
        .mail__notice {
            margin-top: 14px; background: #f0fdf4; border: 1px solid #86efac;
            padding: 12px 14px; color: #166534; font-size: 13px; border-radius: 4px;
        }
        .mail__badge {
            display: inline-block; padding: 4px 12px; background: #16a34a;
            color: #ffffff; font-size: 13px; font-weight: 700; border-radius: 4px;
            margin-bottom: 16px;
        }
        .mail__footer {
            padding: 16px 32px 20px; font-size: 12px; color: #888888;
            border-top: 1px solid #e5e5e5; text-align: center;
        }
        @media only screen and (max-width: 600px) {
            .mail__header, .mail__body, .mail__footer { padding-left: 20px !important; padding-right: 20px !important; }
        }
    </style>
</head>

<body class="mail" style="margin:0;background:#f5f5f5;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" class="mail__wrapper">

    <table class="mail__container" cellpadding="0" cellspacing="0">

        <tr>
            <td class="mail__header">{{ config('app.name') }}</td>
        </tr>

        <tr>
            <td class="mail__body">
                <div class="mail__badge">✓ {{ $actionLabel }}</div>

                <div class="mail__title">Good news for your account</div>

                <p class="mail__text" style="margin-top:0;">
                    Hello {{ $targetUserName }},
                </p>

                <p class="mail__text">
                    Our team has taken a positive action on your account:
                    <strong>{{ $actionLabel }}</strong>.
                </p>

                <div class="mail__notice">
                    {{ $message }}
                </div>

                <p class="mail__text">
                    If you have any questions, please contact our support team.
                </p>
            </td>
        </tr>

        <tr>
            <td class="mail__footer">
                © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
            </td>
        </tr>

    </table>

</td></tr>
</table>
</body>
</html>
