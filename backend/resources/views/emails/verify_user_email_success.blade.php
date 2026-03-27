<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Account Verified</title>

    <style>
        .mail {
            background: #f5f5f5;
            font-family: Arial, sans-serif;
        }

        .mail__wrapper {
            width: 100%;
            padding: 40px 0;
        }

        .mail__container {
            width: 520px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e0e0e0;
        }

        .mail__body {
            padding: 32px;
            color: #333;
            font-size: 14px;
            line-height: 1.6;
        }

        .mail__title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
        }

        .mail__text {
            margin: 12px 0;
        }

        .mail__button-wrapper {
            margin: 24px 0;
            text-align: center;
        }

        .mail__button {
            display: inline-block;
            padding: 10px 18px;
            background: #000000;
            color: #ffffff;
            text-decoration: none;
            font-size: 14px;
            font-weight: 600;
        }

        .mail__footer {
            padding: 16px 32px;
            font-size: 12px;
            color: #888;
            border-top: 1px solid #e0e0e0;
        }
    </style>
</head>

<body class="mail" style="margin:0;background:#f5f5f5;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" class="mail__wrapper">

    <table class="mail__container" cellpadding="0" cellspacing="0">

        <!-- Body -->
        <tr>
            <td class="mail__body">

                <div class="mail__title">
                    🎉 Your account has been verified!
                </div>

                <p class="mail__text">
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

                <p class="mail__text">
                    If you have any questions or need help, feel free to contact our support team.
                </p>

                <p class="mail__text">
                    We're glad to have you with us 🚀
                </p>

            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td class="mail__footer">
                © {{ date('Y') }} {{ config('app.name') }}
            </td>
        </tr>

    </table>

</td>
</tr>
</table>

</body>
</html>
