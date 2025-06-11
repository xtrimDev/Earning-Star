const express = require("express");
const router = new express.Router();

const { gameData, referredCheck } = require("../game/gameData");

const { ensureNotAuthenticated } = require("../auth/middleware/auth");
const getUserDetails = require("../auth/details");
const { withdraw } = require("../game/withdrawal");
const { withdrawalAmount, DefaultSpins, withdrawalStatus } = require("../bot/getSettings");
const { ChannelJoinedOrNot, getChannelList } = require("../bot/channel");
const { ifAdminRedirectAdmin } = require("../auth/middleware/admin");
const { updateChannelJoined } = require("../bot/updateChannelJoined");
const spinAndRefer = require("../game/models/spinAndRefer");
const userModel = require("../auth/models/user");

require("dotenv").config();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/", ensureNotAuthenticated, async (req, res) => {
    try {
        let allPrimaryChannelJoined = true;
        let notJoinedList = [];
        let i = 0;

        result = await getChannelList(2);

        if (result && result.length > 0) {
            for (const channel of result) {
                const res2 = await ChannelJoinedOrNot(channel.username, req.user.u_Id);

                if (!res2) {
                    allPrimaryChannelJoined = false;
                    notJoinedList[i] = channel;
                    i++;
                } else {
                    await updateChannelJoined(channel.username, req.user._id);
                }
            }
        }

        if (allPrimaryChannelJoined) {
            const res2 = await referredCheck(req.user._id);

            if (res2 && res2.type == 1 && !res2.fetchedData.referredDone) {
                const rex = await spinAndRefer.updateOne({ 
                    'referredUsers.userId': res2.fetchedData._id },
                    { 
                        $set: { 'referredUsers.$.UserTaskComplete': true },
                        $inc: { spinsAvailable: 1 }
                    });

                await userModel.updateOne({_id: req.user._id}, {$set: {referredDone: true}})
            }
        }

        const { userGameData } = await gameData(req.user._id)
        const referredUserNames = [];

        if (userGameData.referredUsers.length > 0) {
            let x = 0;
            for (i = 0; i < userGameData.referredUsers.length && i < 50; i++) {
                const userData = await getUserDetails(userGameData.referredUsers[i].userId);
                if (userData.type == 1 && userData.userDetail.verified == true && userGameData.referredUsers[i].UserTaskComplete == true) {
                    referredUserNames[x] = userData.userDetail.name
                    x++
                }
            }
        }

        const withdrawalAmt = await withdrawalAmount();
        const defaultSpinAmt = await DefaultSpins();

        return res.render("home/index", {
            appName: process.env.APP_NAME,
            userData: req.user,
            userGameData,
            getUserDetails,
            referredUserNames,
            withdrawalAmount: withdrawalAmt,
            defaultSpins: defaultSpinAmt,
            allPrimaryChannelJoined: allPrimaryChannelJoined,
            notJoinedList
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

        // Validate withdrawalAmt
        if (!withdrawalAmt || withdrawalAmt === '') {
            return res.status(400).send("withdrawal Amount is required");
        }
        if (!isNumeric(withdrawalAmt)) {
            return res.status(400).send("Enter a valid withdrawal Amount");
        }

        const amt = await withdrawalAmount();

        if (withdrawalAmt < amt) {
            return res.status(400).send(`Withdrawal Amount could not below ₹${amt}`);
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

        const status = await withdrawalStatus();

        let allChannelJoined = true;

        const result = await getChannelList(0);

        if (result && result.length > 0) {
            for (const channel of result) {
                const res2 = await ChannelJoinedOrNot(channel.username, req.user.u_Id);

                if (!res2) {
                    allChannelJoined = false;
                    break;
                }
            }
        }

        if (!allChannelJoined) {
            return res.status(400).send("Join all Channels to withdraw money");
        } else {
            if (status && status == 1) {
                const result = await withdraw(withdrawalAmt, name, upiId, req.user._id);

                if (result && result.type == 1) {
                    return res.send("success");
                } else {
                    return res.status(400).send(result.message);
                }
            } else {
                return res.send("disabled");
            }
        }
    } catch (error) {
        return res.status(500).send("Something Went wrong");
    }
});

module.exports = router;
