const express = require("express");
const { ensureNotAuthenticated } = require("../auth/middleware/auth");
const { ifNotAdminRedirectHome } = require("../auth/middleware/admin");
const router = new express.Router();

router.get("/", ensureNotAuthenticated, ifNotAdminRedirectHome, (req, res) => {
    return res.send(`
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Centered Redirect Button</title>
    <style>
        /* Basic reset and full height for the body */
        body {
            margin: 0;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f4f4f4;
            font-family: Arial, sans-serif;
        }
        /* Container styles */
        .container {
            text-align: center;
        }
        /* Button styles */
        .redirect-button {
            padding: 10px 20px;
            font-size: 16px;
            color: #fff;
            background-color: #007bff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        .redirect-button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <button class="redirect-button" id='redirectMe' onclick="window.location.href='https://t.me/earnYourMoneyXBot'">Go to Admin Panel</button>
    </div>
    <script>
            document.addEventListener('DOMContentLoaded', (event) => {
                const button = document.getElementById('redirectMe');
                if (button) {
                    button.click();
                }
            });
        </script>
</body>
</html>`);
});

module.exports = router;
