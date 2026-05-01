<!DOCTYPE html>
<html>
<head>
    <title>Verify your appeal request</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px;">
    <h2>Verify your appeal request</h2>
    <p>You recently requested to file an appeal for a moderation action.</p>
    <p>Please click the button below to verify your email address and continue with your appeal. This link will expire in 7 days.</p>
    
    <p style="margin: 30px 0;">
        <a href="{{ $appealLink }}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Verify Email & Continue
        </a>
    </p>

    <p style="font-size: 14px; color: #666;">
        If the button above doesn't work, you can copy and paste the following link into your browser:
        <br>
        <a href="{{ $appealLink }}" style="color: #0066cc;">{{ $appealLink }}</a>
    </p>

    <p style="margin-top: 40px; font-size: 12px; color: #999;">
        If you didn't request this appeal, you can safely ignore this email.
    </p>
</body>
</html>
