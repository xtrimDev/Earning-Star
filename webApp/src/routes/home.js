const express = require("express");
const router = new express.Router();

const { gameData } = require("../game/gameData");

const { ensureNotAuthenticated } = require("../auth/middleware/auth");
const getUserDetails = require("../auth/details");
const { withdraw } = require("../game/withdrawal");

router.get("/", ensureNotAuthenticated, async (req, res) => {
    try {
        const { userGameData } = await gameData(req.user._id)
        const referredUserNames = [];

        if (userGameData.referredUsers.length > 0) {
            let x = 0;
            for (i = 0; i < userGameData.referredUsers.length && i < 50; i++) {
                const userData = await getUserDetails(userGameData.referredUsers[i].userId);
                if (userData.type == 1 && userData.userDetail.verified == true && userGameData.referredUsers[i].UserActivation == true) {
                    referredUserNames[x] = userData.userDetail.name
                    x++
                }
            }
        }

        return res.render("home/index", {
            appName: process.env.APP_NAME,
            userData: req.user,
            userGameData,
            getUserDetails,
            referredUserNames
        });
    } catch (error) {
        return res.status(500).render("errors/500");
    }

});

router.post("/withdraw", async (req, res) => {
    try {
        const isNumeric = (str) => /^\d+$/.test(str);

        const withdrawalAmt = req.body.withdrawalAmt;
        const name = req.body.name.trim();
        const upiId = req.body.upiId.trim();
        const password = req.body.password;

        // Validate withdrawalAmt
        if (!withdrawalAmt || withdrawalAmt === '') {
            return res.status(400).send("withdrawal Amount is required");
        }
        if (!isNumeric(withdrawalAmt)) {
            return res.status(400).send("Enter a valid withdrawal Amount");
        }
        if (withdrawalAmt < 100) {
            return res.status(400).send("Withdrawal Amount should be more than ₹99");
        }

        // Validate name
        if (!name || name.trim() === '') {
            return res.status(400).send("Name is required");
        }
        if (name.length < 3 || name.length > 20) {
            return res.status(400).send("Name length should be between 3 and 20 characters");
        }

        // Validate upiId
        if (!upiId || upiId.trim() === '') {
            return res.status(400).send("UPI ID is required");
        }
        const upiRegex = /^[\w\.-]+@[\w\.-]+$/;
        if (!upiRegex.test(upiId)) {
            return res.status(400).send("Enter a valid UPI ID");
        }

        // Validate password
        if (!password || password.trim() === '') {
            return res.status(400).send("Password is required");
        }
        if (password.length < 3 || password.length > 128) {
            return res.status(400).send("Enter a valid password");
        }

        const result = await withdraw(withdrawalAmt, name, upiId, req.user._id, password);

        if (result && result.type == 1) {
            return res.send("success");
        } else {
            if (result.name === 'ValidationError') {
                const firstErrorField = Object.keys(result.errors)[0];
                return res.status(400).send(result.errors[firstErrorField].message);
            } else {
                return res.status(400).send(result.message);
            }
        }
    } catch (error) {
        return res.status(500).render("errors/500");
    }
});

module.exports = router;
