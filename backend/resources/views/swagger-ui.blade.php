<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TikTok V2 API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
        html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            background: #fafafa;
        }

        #swagger-ui {
            height: 100%;
        }
    </style>
</head>
<body>
<div id="swagger-ui"></div>

<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>
    window.onload = function () {
        window.ui = SwaggerUIBundle({
            url: "{{ route('swagger.spec') }}",
            dom_id: '#swagger-ui',
            deepLinking: true,
            displayRequestDuration: true,
            persistAuthorization: true,
            tryItOutEnabled: true,
        });
    };
</script>
</body>
</html>
