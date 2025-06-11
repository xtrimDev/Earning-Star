const express = require("express");
const router = new express.Router();
const axios = require("axios");

const { v4: uuidv4 } = require('uuid');
const passport = require('passport');

require("dotenv").config();

const registerNewUser = require("../auth/register");
const { verifyUser, createVerifyUser, removeVerifyUser } = require("../auth/verify");
const unregisterUser = require("../auth/unregister");
const setPassword = require("../auth/setPassword");
const userDetailsByEmail = require("../auth/detailsByEmail");

const { gamePlayed } = require("../game/gameData");

const { ensureAuthenticated, ensureNotAuthenticated } = require("../auth/middleware/auth");
const smtp = require("../modules/smtp");

const { emailVerificationHtml, passwordResetHtml } = require("../structure/mail");
const { emailVerifiedHtml, expiredLinkHtml } = require("../structure/message");

const app = express();

app.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.all("/", ensureAuthenticated, (req, res) => {
  return res.redirect(`${req.protocol}://${req.get('host')}/auth/login`);
});

router.get("/login", ensureAuthenticated, (req, res) => {
  return res.render("auth/login");
});

router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  // Validate email
  if (!email || email.trim() === '') {
    return res.status(400).send("Email is required");
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).send("Enter a valid email address");
  }

  // Validate password
  if (!password || password.trim() === '') {
    return res.status(400).send("Password is required");
  }

  passport.authenticate('local', async (err, user, info) => {
    if (err) {
      return res.status(400).send("Something went wrong");
    }

    if (!user) {
      if (info.message.trim() == "not-verified") {
        const uniqueString = uuidv4();
        const _id = info.userId.trim();
        const expiresAt = Date.now() + (60000 * 15); //Expires in 15 min

        const resultx = await removeVerifyUser(_id);
        const processCreateVerify = await createVerifyUser(_id, uniqueString, expiresAt);

        if (processCreateVerify && processCreateVerify.type == 1) {
          smtp.verify(async (err, data) => {
            if (err) {
              const result2 = await removeVerifyUser(_id);
              return res.status(400).send("Something went wrong");
            } else {
              let mailOptions = {
                from: `${process.env.APP_NAME} <${process.env.SMTP_EMAIL}>`,
                to: `${email}`,
                subject: `Verification for ${process.env.APP_NAME}`,
                html: emailVerificationHtml(`${req.protocol}://${req.get('host')}/auth/verify/${_id}/${uniqueString}`)
              };

              smtp.sendMail(mailOptions, async (error, info) => {
                if (error) {
                  const result2 = await removeVerifyUser(_id);
                  return res.status(400).send("Something went wrong");
                }
              });
            }
          });
        } else {
          return res.status(400).send("Something Went wrong");
        }
      }

      return res.status(400).send(info.message);
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.status(400).send("Something went wrong");
      }
      return res.send("success");
    });
  })(req, res, next);
});

router.get("/register", ensureAuthenticated, (req, res) => {
  return res.render("auth/register", { referredBy: req.query.referredBy });
});

router.post("/register", async (req, res) => {
  try {
    const isNumeric = (str) => /^\d+$/.test(str);

    const name = req.body.name.trim();
    const email = req.body.email.trim();
    const mobile = req.body.mobile.trim();
    const password = req.body.password;
    const referral = req.body.referral

    // Validate name
    if (!name || name.trim() === '') {
      return res.status(400).send("Name is required");
    }
    if (name.length < 3 || name.length > 20) {
      return res.status(400).send("Name length should be between 3 and 20 characters");
    }

    // Validate email
    if (!email || email.trim() === '') {
      return res.status(400).send("Email is required");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send("Enter a valid email address");
    }

    // Validate mobile
    if (!mobile || mobile.trim() === '') {
      return res.status(400).send("Mobile number is required");
    }
    if (mobile.length != 10 || !isNumeric(mobile)) {
      return res.status(400).send("Enter a valid mobile number");
    }

    // Validate password
    if (!password || password.trim() === '') {
      return res.status(400).send("Password is required");
    }
    if (password.length < 8 || password.length > 128) {
      return res.status(400).send("Password must be between 8 and 128 characters long");
    }

    if (referral && referral.trim().length != 6) {
      return res.status(400).send("Enter a valid referral code.");
    }

    const result = await registerNewUser(name, email, mobile, password, referral);

    if (result && result.type == 1) {
      const uniqueString = uuidv4();
      const { _id } = result.userDetail;
      const expiresAt = Date.now() + (60000 * 15); //Expires in 15 min

      const processCreateVerify = await createVerifyUser(_id, uniqueString, expiresAt);

      if (processCreateVerify && processCreateVerify.type == 1) {
        smtp.verify(async (err, data) => {
          if (err) {
            const result = await unregisterUser(email);
            const result2 = await removeVerifyUser(_id);
            return res.status(400).send("Something went wrong");
          } else {
            let mailOptions = {
              from: `${process.env.APP_NAME} <${process.env.SMTP_EMAIL}>`,
              to: `${email}`,
              subject: `Verification for ${process.env.APP_NAME}`,
              html: emailVerificationHtml(`${req.protocol}://${req.get('host')}/auth/verify/${_id}/${uniqueString}`)
            };

            smtp.sendMail(mailOptions, async (error, info) => {
              if (error) {
                const result = await unregisterUser(email);
                const result2 = await removeVerifyUser(_id);
                return res.status(400).send("Something went wrong");
              }
              return res.send("success");
            });
          }
        });
      } else {
        const result = await unregisterUser(email);
        return res.status(400).send("Something Went wrong");
      }
    } else {
      if (result.name === 'ValidationError') {
        const firstErrorField = Object.keys(result.errors)[0];
        return res.status(400).send(result.errors[firstErrorField].message);
      } else {
        return res.status(400).send(result.message);
      }
    }
  } catch (error) {
    return res.status(400).send("Something went wrong");
  }
});

router.get("/verify/:userId/:uniqueString", ensureAuthenticated, async (req, res) => {
  try {
    let { userId, uniqueString } = req.params;

    const result = await verifyUser(userId, uniqueString);

    if (result && result.type == 1) {
      const successHtml = emailVerifiedHtml(`${req.protocol}://${req.get('host')}/auth/login`);
      return res.send(successHtml);
    } else {
      throw new Error("link expired")
    }
  } catch (error) {
    return res.status(410).send(expiredLinkHtml());
  }
});

router.get("/forgotPassword", ensureAuthenticated, (req, res) => {
  res.render("auth/forgotPassword");
});

router.post("/forgotPassword", async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || email.trim() === '') {
      return res.status(400).send("Email is required");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send("Enter a valid email address");
    }

    const result = await userDetailsByEmail(email);

    if (result && result.type == 1) {
      const uniqueString = uuidv4();
      const { _id } = result.userDetail;
      const expiresAt = Date.now() + (60000 * 15); //Expires in 15 min

      const resultx = await removeVerifyUser(_id);
      const processCreateVerify = await createVerifyUser(_id, uniqueString, expiresAt);

      if (processCreateVerify && processCreateVerify.type == 1) {
        smtp.verify(async (err, data) => {
          if (err) {
            const result = await removeVerifyUser(_id);
            return res.status(400).send("Something went wrong");
          } else {
            let mailOptions = {
              from: `${process.env.APP_NAME} <${process.env.SMTP_EMAIL}>`,
              to: `${email}`,
              subject: `Password reset for ${process.env.APP_NAME}`,
              html: passwordResetHtml(`${req.protocol}://${req.get('host')}/auth/reset/verify/${_id}/${uniqueString}`)
            };

            smtp.sendMail(mailOptions, async (error, info) => {
              if (error) {
                const result = await removeVerifyUser(_id);
                return res.status(400).send("Something went wrong");
              }
            });

            return res.send("success");
          }
        });
      } else {
        return res.status(400).send("Something Went wrong");
      }
    } else {
      return res.status(400).send(result.message);
    }
  } catch (error) {
    return res.status(400).send("Something went wrong");
  }
});

router.get("/reset/verify/:userId/:uniqueString", ensureAuthenticated, async (req, res) => {
  try {
    const { userId, uniqueString } = req.params;

    const result = await verifyUser(userId, uniqueString, 0);

    if (result && result.type == 1) {
      return res.render("auth/reset", { userId, uniqueString });
    } else {
      return res.status(410).send(expiredLinkHtml());
    }
  } catch (error) {
    return res.status(410).send(expiredLinkHtml());
  }
})

router.post("/reset", async (req, res) => {
  try {
    const { password, confirmPassword, userId, uniqueString } = req.body;

    // Validate password
    if (!password || password.trim() === '') {
      return res.status(400).send("Password is required");
    }
    if (password.length < 8 || password.length > 128) {
      return res.status(400).send("Password must be between 8 and 128 characters long");
    }

    // Validate password
    if (!confirmPassword || password.trim() === '') {
      return res.status(400).send("Confirm Password is required");
    }

    if (password !== confirmPassword) {
      return res.status(400).send("Password and confirm password did not matched");
    }

    if (userId.trim() == '' || userId.length !== 24) {
      return res.status(400).send("Something went wrong");
    }

    if (uniqueString.trim() == '' || uniqueString.length < 10) {
      return res.status(400).send("Something went wrong");
    }

    const result = await verifyUser(userId, uniqueString, 0);

    if (result && result.type == 1) {
      const verify = await setPassword(userId, password);

      if (verify && verify.type == 1) {
        await removeVerifyUser(userId);
        return res.send("success");
      } else {
        return res.status(400).send("Something went wrong");
      }
    } else {
      return res.status(410).send("Sorry, the link is invalid or has expired.");
    }
  } catch (error) {
    return res.status(400).send("Something went wrong");
  }
})

router.post("/spin", async (req, res) => {
  try {
    axios.get(`${req.protocol}://${req.get('host')}/get/randomNumber`)
      .then(async function (response) {
        const result = await gamePlayed(req.user._id, response.data);

        if (result && result.type == 1) {
          return res.send(`${response.data}`);
        } else {
          throw new Error("something went wrong");
        }
      })
      .catch(function (error) {
        res.status(400).send("something went wrong");
      });
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
})

module.exports = router;