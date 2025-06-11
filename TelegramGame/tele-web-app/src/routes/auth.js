const express = require("express");
const router = new express.Router();

const axios = require("axios");
const passport = require('passport');

require("dotenv").config();

const {registerNewUser, unregister} = require("../auth/register");

const { ensureAuthenticated, ensureNotAuthenticated } = require("../auth/middleware/auth");
const { gamePlayed, createUserGameData } = require("../game/gameData");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.all("/", ensureAuthenticated, (req, res) => {
  return res.redirect(`${req.protocol}://${req.get('host')}/auth/login`);
});

router.get("/login", ensureAuthenticated, (req, res) => {
  return res.render("auth/login");
});

router.post("/login", async (req, res, next) => {
  const { userId, first_name, last_name, username, token, start_param } = req.body;

  if (!userId || userId.trim() === '') {
    return res.status(400).send("UserId is required");
  }

  if (!first_name && !last_name  || first_name.trim() === '' && last_name.trim() === '') {
    return res.status(400).send("Name is required");
  }

  if (!token || token.trim() === '') {
    return res.status(400).send("Token is required");
  }

  if (token != 'l8o8ab7ix5cbr1p7') {
    return res.status(400).send("Token is invalid");
  }

  if (start_param && start_param.trim().length != 6) {
    return res.status(400).send("Enter a valid start_param.");
  }

  passport.authenticate('local', async (err, user, info) => {
    if (err) {
      return res.status(400).send("Something went wrong");
    }

    if (!user) {
      if (info.message.trim() == 'User not found') {
        const result = await axios.post(`${req.protocol}://${req.get('host')}/auth/register`, {
          userId,
          first_name,
          last_name,
          username,
          start_param
        });

        if (result.data.trim() == 'success') {
          return res.status(200).send("success");
        } else {
          return res.status(400).send("Something went wrong");
        }
      } else {
        return res.status(400).send("Something went wrong");
      }
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.status(400).send("Something went wrong");
      }
      return res.send("success");
    });
  })(req, res, next);
});

router.post("/register", async (req, res) => {
  const { userId, first_name, last_name, username, start_param } = req.body;

  if (!userId || userId.trim() === '') {
    return res.status(400).send("UserId is required");
  }

  if (!first_name && !last_name  || first_name.trim() === '' && last_name.trim() === '') {
    return res.status(400).send("Name is required");
  }

  if (start_param && start_param.trim().length != 6) {
    return res.status(400).send("Enter a valid start_param.");
  }

  const result = await registerNewUser(userId, `${first_name} ${last_name}`, username);

  if (result && result.type == 1) {
    const result2 = await createUserGameData(result.userData._id, start_param);

    if (result2 && result2.type == 1) {
      return res.send("success");
    } else {
      await unregister(userId);
      return res.status(400).send("Something went wrong");
    }
  } else {
    return res.status(400).send("Something went wrong");
  }
});

router.post("/spin", ensureNotAuthenticated, async (req, res) => {
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