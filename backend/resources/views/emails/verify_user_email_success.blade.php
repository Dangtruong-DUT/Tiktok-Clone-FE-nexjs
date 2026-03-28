<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Verified</title>

    <style>
        .mail {
            margin: 0;
            background: #edf2f7;
            font-family: Arial, sans-serif;
        }

        .mail__wrapper {
            width: 100%;
            padding: 28px 14px;
        }

        .mail__container {
            width: 560px;
            max-width: 100%;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #d9e3f0;
            border-radius: 14px;
            overflow: hidden;
        }

        .mail__hero {
            background: #1a4c35;
            padding: 28px 32px;
            text-align: center;
        }

        .mail__logo {
            width: 58px;
            height: 58px;
            display: block;
            margin: 0 auto;
            border: 0;
            border-radius: 12px;
            background: #ffffff;
            padding: 6px;
            box-sizing: border-box;
        }

        .mail__brand {
            margin-top: 12px;
            color: #ffffff;
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 0.2px;
        }

        .mail__eyebrow {
            margin-top: 6px;
            color: #bde4ce;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .mail__body {
            padding: 28px 32px;
            color: #223046;
            font-size: 14px;
            line-height: 1.65;
        }

        .mail__title {
            font-size: 24px;
            line-height: 1.25;
            font-weight: 700;
            margin: 0 0 16px;
            color: #113b27;
        }

        .mail__text {
            margin: 10px 0;
        }

        .mail__button-wrapper {
            margin: 24px 0;
            text-align: center;
        }

        .mail__button {
            display: inline-block;
            padding: 12px 22px;
            background: #113b27;
            color: #ffffff;
            text-decoration: none;
            font-size: 14px;
            font-weight: 700;
            border-radius: 999px;
            letter-spacing: 0.2px;
        }

        .mail__notice {
            margin-top: 14px;
            background: #f4fbf7;
            border: 1px solid #d3eadc;
            border-radius: 10px;
            padding: 12px 14px;
            color: #23543d;
            font-size: 13px;
        }

        .mail__footer {
            padding: 16px 32px 20px;
            font-size: 12px;
            color: #7b8aa0;
            border-top: 1px solid #e5edf7;
            text-align: center;
        }

        @media only screen and (max-width: 600px) {
            .mail__hero,
            .mail__body,
            .mail__footer {
                padding-left: 20px !important;
                padding-right: 20px !important;
            }
        }
    </style>
</head>

<body class="mail" style="margin:0;background:#edf2f7;">

@php
    $appUrl = rtrim(config('app.url'), '/');
    $logoUrl = $appUrl . '/favicon.ico';
@endphp

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" class="mail__wrapper">

    <table class="mail__container" cellpadding="0" cellspacing="0">

        <!-- Hero -->
        <tr>
            <td class="mail__hero">
                <a href="{{ $appUrl }}" target="_blank" style="text-decoration:none;display:inline-block;">
                    <img src="{{ $logoUrl }}" alt="{{ config('app.name') }} logo" width="56" height="56" class="mail__logo" style="display:block;border:0;outline:none;text-decoration:none;">
                </a>
                <div class="mail__brand">{{ config('app.name') }}</div>
                <div class="mail__eyebrow">Verification complete</div>
            </td>
        </tr>

        <!-- Body -->
        <tr>
            <td class="mail__body">

                <div class="mail__title">
                    🎉 Your account has been verified!
                </div>

                <p class="mail__text" style="margin-top:0;">
                    Hello {{ $name }},
                </p>

                <p class="mail__text">
                    Congratulations! Your account has been successfully verified.
                </p>

                <p class="mail__text">
                    Welcome to <strong>{{ config('app.name') }}</strong>. You can now enjoy all features of our platform.
                </p>

                <div class="mail__button-wrapper">
                    <a href="{{ $homeUrl }}" class="mail__button" target="_blank">
                        Go to Dashboard
                    </a>
                </div>

                <div class="mail__notice">
                    If you have any questions or need help, feel free to contact our support team.
                </div>

                <p class="mail__text">
                    We're glad to have you with us 🚀
                </p>

            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td class="mail__footer">
                © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
            </td>
        </tr>

    </table>

</td>
</tr>
</table>

</body>
</html>
