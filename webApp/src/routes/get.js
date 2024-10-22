const express = require("express");
const router = new express.Router();

const crypto = require("crypto");

const { ensureNotAuthenticated } = require("../auth/middleware/auth");
const userDetail = require("../auth/details");
const { withdrawHistory } = require("../game/withdrawal");

require("dotenv").config();

router.get("/:what", async (req, res) => {
    try {
        const { what } = req.params;
        if (what == "AppName") {
            res.send(process.env.APP_NAME);
        } else if (what == "myReferral") {
            const result = await userDetail(req.user._id);
            if (result && result.type == 1) {
                return res.send(`${result.userGameData.userGameData.referralCode}`);
            } else {
                return res.status(404).render("Error While fetching user referral code");
            }
        }  else if (what =="mySpinsAvailable") {
            const result = await userDetail(req.user._id);
            if (result && result.type == 1) {
                return res.send(`${result.userGameData.userGameData.spinsAvailable}`);
            } else {
                return res.status(404).render("Error While fetching user's available spins");
            }
        } else if (what =="myEarning") {
            const result = await userDetail(req.user._id);
            if (result && result.type == 1) {
                return res.send(`${result.userGameData.userGameData.totalEarnings}`);
            } else {
                return res.status(404).render("Error While fetching user's total earning");
            }
        } else if (what == "transactionHistory") {
            const result = await withdrawHistory(req.user._id);

            if (result && result.length > 0) {
                return res.send(result);
            } else {
                return res.send("failed");
            }
        } else if (what == "randomNumber") {
            function getRandomNumberWithProbability() {
                const randomBytes = crypto.randomBytes(1); // Generate 1 byte of random data
                const randomNumber = randomBytes[0] % 101; // Get a number between 0 to 100
    
                // Implementing probability logic
                if (randomNumber >= 30 && randomNumber <= 100) {
                    // Generate a second random number to decide if we should return this number
                    const probabilityBytes = crypto.randomBytes(1);
                    const probabilityNumber = probabilityBytes[0] % 100; // Gives a number between 0 to 99
    
                    if (probabilityNumber < 5) {
                        // 15% probability of returning this number
                        return randomNumber;
                    } else {
                        // Retry if the probability condition is not met
                        return getRandomNumberWithProbability();
                    }
                } else {
                    return randomNumber; // Return numbers from 0 to 29 as they are
                }
            }
    
            return res.send(`${getRandomNumberWithProbability()}`);
        }else {
            return res.status(404).render("errors/404");
        }
    } catch (error) {
        return res.status(500).render("errors/500");
    }
});

module.exports = router;
