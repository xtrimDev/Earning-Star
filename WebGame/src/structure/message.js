const emailVerifiedHtml = (redirectUrl) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification Completed</title>
    <style>
        body, html {
            height: 100%;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: Arial, sans-serif;
            background: #f7f7f7;
        }

        .container {
            text-align: center;
            padding: 20px;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .container h1 {
            font-size: 24px;
            margin-bottom: 20px;
        }

        .container p {
            font-size: 18px;
            margin-bottom: 20px;
        }

        .container .countdown {
            font-weight: bold;
            color: #ff6600;
        }

        @media (max-width: 600px) {
            .container {
                padding: 15px;
            }

            .container h1 {
                font-size: 20px;
            }

            .container p {
                font-size: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Email Verification Completed</h1>
        <p>Thank you for verifying your email. You will be redirected to the login page in <span class="countdown" id="countdown">5</span> seconds.</p>
    </div>

    <script>
        let countdownElement = document.getElementById('countdown');
        let countdown = 5;

        function updateCountdown() {
            countdown--;
            countdownElement.textContent = countdown;
            if (countdown <= 0) {
                window.location.href = '${redirectUrl}'; 
            }
        }

        setInterval(updateCountdown, 1000);
    </script>
</body>
</html>`;
  };

const expiredLinkHtml = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Link Expired</title>
    <style>
        body, html {
            height: 100%;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: Arial, sans-serif;
            background: #f7f7f7;
        }

        .container {
            text-align: center;
            padding: 20px;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .container h1 {
            font-size: 24px;
            margin-bottom: 20px;
        }

        .container p {
            font-size: 18px;
            margin-bottom: 20px;
        }

        .container button {
            font-size: 16px;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            background: #ff6600;
            color: #fff;
        }

        .container button:hover {
            background: #e55d00;
        }

        @media (max-width: 600px) {
            .container {
                padding: 15px;
            }

            .container h1 {
                font-size: 20px;
            }

            .container p {
                font-size: 16px;
            }

            .container button {
                font-size: 14px;
                padding: 8px 16px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Link Expired</h1>
        <p>Sorry, the verification link is invalid or has expired.</p>
    </div>
</body>
</html>
`;
}

module.exports = {emailVerifiedHtml, expiredLinkHtml};
