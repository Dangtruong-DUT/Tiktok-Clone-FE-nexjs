<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subjectLine }}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; background: #f9fafb; margin: 0; padding: 20px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">
        <tr>
            <td style="padding: 24px;">
                <h2 style="margin: 0 0 12px; font-size: 20px; color: #111827;">{{ $subjectLine }}</h2>

                <p style="margin: 0 0 14px;">Hi {{ $targetUserName }},</p>
                <p style="margin: 0 0 14px; white-space: pre-line;">{{ $messageBody }}</p>

                <p style="margin: 16px 0 0;">Regards,<br>{{ $adminName }} (Admin Team)</p>

                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="margin: 0; font-size: 12px; color: #6b7280;">This message was sent from {{ $appName }} admin panel.</p>
            </td>
        </tr>
    </table>
</body>
</html>
