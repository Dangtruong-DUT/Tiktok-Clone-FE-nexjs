<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subjectLine }}</title>
</head>

<body style="margin:0;background:#f5f5f5;font-family:Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:28px 14px;">

    <table width="560" style="max-width:100%;background:#ffffff;border:1px solid #e0e0e0;">

        <!-- Header -->
        <tr>
            <td style="padding:20px 32px 0;font-size:13px;font-weight:700;color:#000000;">
                {{ $appName }}
            </td>
        </tr>

        <!-- Body -->
        <tr>
            <td style="padding:20px 32px 28px;font-size:14px;line-height:1.65;color:#333333;">

                <div style="font-size:24px;font-weight:700;margin-bottom:16px;color:#000000;">
                    {{ $subjectLine }}
                </div>

                <p style="margin:0 0 12px;">
                    Hello {{ $targetUserName }},
                </p>

                <p style="margin:0 0 14px;white-space:pre-line;">
                    {{ $messageBody }}
                </p>

                <p style="margin-top:20px;">
                    Regards,<br>
                    {{ $adminName }} (Admin Team)
                </p>

            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="padding:16px 32px 20px;font-size:12px;color:#888888;border-top:1px solid #e5e5e5;text-align:center;">
                © {{ date('Y') }} {{ $appName }}. All rights reserved.
            </td>
        </tr>

    </table>

</td>
</tr>
</table>

</body>
</html>
