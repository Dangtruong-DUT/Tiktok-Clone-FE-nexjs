<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>

    <style>
        .mail {
            margin: 0;
            background: #f5f5f5;
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
            border: 1px solid #e0e0e0;
            /* bỏ bo góc */
        }

        .mail__header {
            padding: 20px 32px 0;
            color: #000000;
            font-size: 13px;
            font-weight: 700;
        }

        .mail__body {
            padding: 20px 32px 28px;
            color: #333333;
            font-size: 14px;
            line-height: 1.65;
        }

        .mail__title {
            font-size: 24px;
            line-height: 1.25;
            font-weight: 700;
            margin: 0 0 16px;
            color: #000000;
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
            background: #000000;
            color: #ffffff;
            text-decoration: none;
            font-size: 14px;
            font-weight: 700;
            /* bỏ bo góc */
        }

        .mail__notice {
            margin-top: 14px;
            background: #fafafa;
            border: 1px solid #e5e5e5;
            padding: 12px 14px;
            color: #555555;
            font-size: 13px;
            /* bỏ bo góc */
        }

        .mail__link-wrap {
            margin-top: 14px;
            background: #fafafa;
            border: 1px dashed #d0d0d0;
            padding: 10px 12px;
            /* bỏ bo góc */
        }

        .mail__link {
            font-size: 12px;
            color: #444444;
            word-break: break-all;
            margin: 0;
        }

        .mail__footer {
            padding: 16px 32px 20px;
            font-size: 12px;
            color: #888888;
            border-top: 1px solid #e5e5e5;
            text-align: center;
        }

        @media only screen and (max-width: 600px) {
            .mail__header,
            .mail__body,
            .mail__footer {
                padding-left: 20px !important;
                padding-right: 20px !important;
            }
        }
    </style>
</head>

<body class="mail" style="margin:0;background:#f5f5f5;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" class="mail__wrapper">

    <table class="mail__container" cellpadding="0" cellspacing="0">

        <tr>
            <td class="mail__header">
                {{ config('app.name') }}
            </td>
        </tr>

        <tr>
            <td class="mail__body">

                <div class="mail__title">
                    Reset your password
                </div>

                <p class="mail__text" style="margin-top:0;">
                    Hello {{ $name }},
                </p>

                <p class="mail__text">
                    You requested to reset your password. Click the button below to continue.
                </p>

                <div class="mail__button-wrapper">
                    <a href="{{ $resetUrl }}" class="mail__button" target="_blank">
                        Reset Password
                    </a>
                </div>

                <div class="mail__notice">
                    This link will expire in {{ $expiration }} minutes.
                </div>

                <p class="mail__text">
                    If you didn’t request this, you can safely ignore this email.
                </p>

                <div class="mail__link-wrap">
                    <p class="mail__link">If the button does not work, copy this link:</p>
                    <p class="mail__link">{{ $resetUrl }}</p>
                </div>

            </td>
        </tr>

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
