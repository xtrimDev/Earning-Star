const emailVerificationHtml = (link) => {
  return `<!DOCTYPE html>
  <html lang="en">
  
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f0f0f0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              width: 100vw;
              margin: 0;
              padding: 0;
          }
  
          .container {
              text-align: center;
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              max-width: 400px;
              width: 90%;
              margin: 0 auto;
          }
  
          h1 {
              color: #333;
          }
  
          button {
              background-color: #4CAF50;
              color: white;
              border: none;
              padding: 10px 20px;
              text-align: center;
              text-decoration: none;
              display: inline-block;
              font-size: 16px;
              border-radius: 4px;
              cursor: pointer;
              transition: background-color 0.3s ease;
          }
  
          button:hover {
              background-color: #45a049;
          }
      </style>
  </head>
  
  <body>
      <div class="container">
          <h1>Email Verification</h1>
          <p>Please click the button below to verify your email address.</p>
          <p>This link will expire in 15 min.</p>
          <a href="${link}">
            <button id="verifyButton">Verify Email</button>
          </a>
      </div>
  </body>
  
  </html>`;
};

const passwordResetHtml = (link) => {
    return `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password reset link</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f0f0f0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                width: 100vw;
                margin: 0;
                padding: 0;
            }
    
            .container {
                text-align: center;
                background-color: #fff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                max-width: 400px;
                width: 90%;
                margin: 0 auto;
            }
    
            h1 {
                color: #333;
            }
    
            button {
                background-color: #4CAF50;
                color: white;
                border: none;
                padding: 10px 20px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 16px;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }
    
            button:hover {
                background-color: #45a049;
            }
        </style>
    </head>
    
    <body>
        <div class="container">
            <h1>Password Reset Link</h1>
            <p>Please click the button below to reset your password.</p>
            <p>This link will expire in 15 min.</p>
            <a href="${link}">
              <button id="resetButton">Reset</button>
            </a>
        </div>
    </body>
    
    </html>`;
  };

module.exports = { emailVerificationHtml, passwordResetHtml};
