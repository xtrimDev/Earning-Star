const express = require("express");
const path = require("path");
const passport = require('passport');
const session = require('express-session');
const os = require("os")
const initializePassport = require("./config/passport");

require("ejs");
require("dotenv").config();
require("./server/dbConnect");

const app = express();

initializePassport(passport);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 10 * 60 * 1000 } 
  })
);

app.use(passport.initialize());
app.use(passport.session());

const staticPath = path.join(`${__dirname}./../public`);
const viewsPath = path.join(`${__dirname}./../views`);

app.use(express.static(staticPath));

app.set("view engine", "ejs");
app.set("views", viewsPath);

const auth_route = require("./routes/auth");
const error_route = require("./routes/error");
const home_route = require("./routes/home");
const admin_route = require("./routes/admin");
const get_route = require("./routes/get");

app.use("/auth", auth_route);
app.use("/", home_route);
app.use("/admin", admin_route);
app.use("/get", get_route);
app.use(error_route);

const port = process.env.PORT || 8080;
const protocol = process.env.PROTOCOL || 'http';

const networkInterfaces = os.networkInterfaces();
const localIP = networkInterfaces['en0'] ? networkInterfaces['en0'][0].address : 'localhost';

app.listen(port, () => {
  console.clear();
  console.log(`Connected to the port ${port}`);
  console.log(`${protocol}://${localIP}:${port}`);
}).on('error', (err) => {
  console.log(`Unable to connect to the port ${port}`);
  console.log(`${err}`);
});