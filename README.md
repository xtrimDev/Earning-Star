
## Description
Developed a spin-and-earn game available as both a web application and a Telegram game. Users can spin the wheel to earn rewards, with free spins granted at signup. Additional spins can be earned by inviting friends using a unique referral system. The project is divided into two independent modules: one for web and one for Telegram, allowing flexibility in deployment and platform usage. The referral-based growth mechanism encourages user engagement and repeat interaction.

## Deployment Methods

##### Web App
1. Render
2. Vercel

##### Telegram Game
1. Render + Telegram Bot
2. Vercel + Telegram Bot

###### To run this project, you will need to add the following environment variables to your configuration files

##### For Web:
`APP_NAME` 
`DB_URL` 
`PORT`
`SMTP_EMAIL`
`SMTP_PASS` 
`SESSION_SECRET` 
`DEFAULT_SPINS`


##### For Telegram Game:
`APP_NAME`
`DB_URL`
`PORT` 
`SMTP_EMAIL`
`SMTP_PASS`
`SESSION_SECRET` 
`DEFAULT_SPINS` 
`WITHDRAWAL_AMT` 
`DEFAULT_ADMIN_PASS`
`TELE_WEB_APP_URL` 
`BOT_TOKEN` 

## Deployment

###### For Web:

To install all modules, run:
```bash
cd "WebGame"
```
```bash
npm install
```

To deploy the Web app run:
```bash
node src/app
```

###### For Telegram Game:

Run the Telegram Bot:
```bash
cd "bot"
```
```bash
node node src/app
```

Run the Telegram Web App:
```bash
cd "tele-web-app"
```
```bash
node node src/app
```

## Features

- Spin & Earn game
- Free spins at signup
- Referral system to earn more spins
- Separate web and Telegram versions
- Secure login and user tracking (Web)
- Real-time spin tracking
- Independent platform deployment

## Credits

- [Sameer Singh Bhandari](https://github.com/xtrimDev/)
