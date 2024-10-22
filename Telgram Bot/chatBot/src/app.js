const { MongoClient, ServerApiVersion, Transaction, ObjectId } = require('mongodb');
const { Telegraf } = require('telegraf');
const bcrypt = require("bcrypt");

require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const uri = "mongodb+srv://xtrimDev:QXMEo7PqKe3252ur@winzyluckey.fc2thwh.mongodb.net/";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: false } });

const db = client.db(process.env.DB_NAME)
client.connect();

/** all variables */
let IsPassword = false;

let IsAdminLogged = false;
let adminLoggedTimeout = 0;

let changePasswordAccess = false;
let changeWithdrawalAmountAccess = false;
let changeDefaultSpinsAccess = false;
// let withdrawalStatusAccess = false;
let addChannelAccess = false;
let removeChannelAccess = false;
let setPrimaryChannelAccess = false;
let isRunning = false;
let addSuccessTransaction = false;
let addFailedTransaction = false;
let transactionIdMsg = false;

const defaultRunning = () => {
    isRunning = false;
}

const defaultSetting = () => {
    IsPassword = false;
}

/********************* */
let transactionData = {};
/********************* */

const adminDefaultSettings = () => {
    changePasswordAccess = false;
    changeWithdrawalAmountAccess = false;
    changeDefaultSpinsAccess = false;
    // withdrawalStatusAccess = false;
    addChannelAccess = false;
    removeChannelAccess = false;
    setPrimaryChannelAccess = false;
    addSuccessTransaction = false;
    addFailedTransaction = false;
    transactionIdMsg = false;
}

const resetLogoutTimeOut = (ctx) => {
    clearTimeout(adminLoggedTimeout);
    adminLoggedTimeout = setTimeout(() => {
        IsAdminLogged = false;
        ctx.reply("Logged out due to inactivity");
    }, 1000 * 60 * 2);
}

bot.start((ctx) => {
    if (IsAdminLogged) {
        adminMenu(ctx);
        resetLogoutTimeOut(ctx);
    } else {
        ctx.reply(`Hello ${ctx.from.first_name}, \nSpin and earn your money by referring friends.`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Play Game",
                            url: process.env.TELE_WEB_APP_URL
                        }
                    ]
                ]
            }
        });
    }

    defaultSetting();
    adminDefaultSettings();
});

bot.command("admin", async function (ctx) {
    defaultSetting();
    adminDefaultSettings();

    if (!IsAdminLogged) {
        const result = await db.collection("users").findOne({ u_Id: ctx.chat.id });

        if (result) {
            if (result.type == "1") {
                ctx.reply("Enter your Password");
                IsPassword = true;
            } else {
                ctx.reply("You are not an admin");
            }
        } else {
            ctx.reply("Start game to access this bot", {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Play Game",
                                url: process.env.TELE_WEB_APP_URL
                            }
                        ]
                    ]
                }
            });
        }
    } else {
        resetLogoutTimeOut(ctx);
        adminMenu(ctx);
    }
});

bot.command("logout", (ctx) => {
    defaultSetting();
    adminDefaultSettings();

    if (IsAdminLogged) {
        clearTimeout(resetLogoutTimeOut)
        IsAdminLogged = false;
        ctx.reply("Successfully logged out");
    } else {
        ctx.reply("Your are not logged in.")
    }
});

bot.command("clear", async function (ctx) {
    defaultSetting();
    adminDefaultSettings();

    const chatId = ctx.chat.id;
    const messageId = ctx.message.message_id;

    if (IsAdminLogged) {
        resetLogoutTimeOut(ctx);
    }

    try {
        ctx.reply("Deleting last 10 messages...");

        for (let i = 0; i < 10; i++) {
            try {
                await ctx.telegram.deleteMessage(chatId, messageId - i);
            } catch {
                /** Do nothing */
            }
        }
    } catch (error) {
        /** do nothing */
    } finally {
        try {
            await ctx.telegram.deleteMessage(chatId, messageId + 1);
        } catch {
            /** do nothing  */
        }
    }
});

bot.command("exit", (ctx) => {
    defaultSetting();
    adminDefaultSettings();

    if (IsAdminLogged) {
        resetLogoutTimeOut(ctx);
    }

    ctx.reply("You successfully exit.");
});

bot.on("text", async (ctx) => {
    const chatId = ctx.chat.id;
    const messageId = ctx.message.message_id;

    if (IsAdminLogged) {
        resetLogoutTimeOut(ctx);
    }

    if (IsPassword && !IsAdminLogged) {
        const result = await db.collection("users").findOne({ u_Id: chatId });

        const isPasswordMatch = await bcrypt.compare(ctx.message.text, result.password);

        if (isPasswordMatch) {
            defaultSetting();
            resetLogoutTimeOut(ctx);

            ctx.telegram.sendMessage(chatId, "successfully logged in, you will be log out in 2 min of inactivity");
            IsAdminLogged = true;

            adminMenu(ctx);
        } else {
            IsPassword = true;
            IsAdminLogged = false;

            ctx.reply("**Incorrect Enter your password again");
        }

        adminDefaultSettings();

        setTimeout(async () => {
            try {
                await ctx.telegram.deleteMessage(chatId, messageId);
            } catch {
                /** do nothing */
            }
        }, 3000);
    } else if (changePasswordAccess && IsAdminLogged) {
        defaultSetting()

        const salt = await bcrypt.genSalt(10);
        const newPassword = await bcrypt.hash(ctx.message.text, salt);

        const result = await db.collection("users").updateOne({ u_Id: chatId }, { $set: { password: newPassword } });

        if (result) {
            ctx.reply("Password successfully changed");
        } else {
            ctx.reply("some error occurred while changing the password");
        }

        profileSettingMenu(ctx);

        adminDefaultSettings();

        setTimeout(async () => {
            try {
                await ctx.telegram.deleteMessage(chatId, messageId);
            } catch {
                /** do nothing */
            }
        }, 3000);
    } else if (changeWithdrawalAmountAccess && IsAdminLogged) {
        defaultSetting();
        if (isNaN(parseInt(ctx.message.text))) {
            ctx.reply("** Enter a valid value");
        } else {
            const result = await db.collection("settings").updateOne({ settingType: "Withdrawal Amount" }, {
                $set: {
                    settingValue: ctx.message.text,
                    updatedAt: Date.now()
                }

            }, {
                upsert: true
            })

            if (result) {
                ctx.reply("Withdrawal Amount Successfully changed to : " + ctx.message.text);
            } else {
                ctx.reply("some error occurred while changing the withdrawal amount");
            }

            gameSettingMenu(ctx);
            adminDefaultSettings();
        }
    } else if (changeDefaultSpinsAccess && IsAdminLogged) {
        defaultSetting();

        if (isNaN(parseInt(ctx.message.text))) {
            ctx.reply("** Enter a valid value");
        } else {
            const result = await db.collection("settings").updateOne({ settingType: "Default spins" }, {
                $set: {
                    settingValue: ctx.message.text
                }
            }, {
                upsert: true
            })

            if (result) {
                ctx.reply("Default spin amount updated to : " + ctx.message.text);
            } else {
                ctx.reply("Something went wrong while updating the Default spin amount");
            }

            gameSettingMenu(ctx);

            adminDefaultSettings();
        }
    } else if (addChannelAccess && IsAdminLogged) {
        defaultSetting();

        let result = await db.collection("channels").findOne({ username: ctx.message.text });

        if (!result) {
            let count = await db.collection("channels").countDocuments();

            if (count > 0) {
                count = 0;
            } else {
                count = 1;
            }

            result = await db.collection("channels").insertOne({
                username: ctx.message.text,
                createdBy: ctx.chat.id,
                type: count
            });

            if (result) {
                ctx.reply("Channel List updated Successfully");
                await getChannelList(ctx);
                try {
                    await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id - 2);
                } catch {
                    /** do nothing */
                }
                try {
                    await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id - 1);
                } catch {
                    /** do nothing */
                }
            } else {
                ctx.reply("Something went wrong while updating channel list")
            }
        } else {
            ctx.reply("This channel is already added");
        }
        adminDefaultSettings();
    } else if (removeChannelAccess && IsAdminLogged) {
        defaultSetting();

        let result = await db.collection("channels").findOne({ username: ctx.message.text });

        if (result) {
            result = await db.collection("channels").deleteOne({
                username: ctx.message.text
            });

            if (result) {
                ctx.reply("Channel List updated Successfully");
                await getChannelList(ctx);
                try {
                    await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id - 2);
                } catch {
                    /** do nothing */
                }
                try {
                    await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id - 1);
                } catch {
                    /** do nothing */
                }
            } else {
                ctx.reply("Something went wrong while updating channel list")
            }
        } else {
            ctx.reply("The channel name you entered does not exist.")
        }

        adminDefaultSettings();
    } else if (setPrimaryChannelAccess && IsAdminLogged) {
        defaultSetting();

        let result = await db.collection("channels").findOne({ username: ctx.message.text });

        if (result) {
            result = await db.collection("channels").updateMany({}, {
                $set: {
                    type: 0
                }
            });

            result = await db.collection("channels").updateOne({
                username: ctx.message.text
            }, {
                $set: {
                    type: 1
                }
            });

            if (result) {
                ctx.reply("Channel List updated Successfully");
                await getChannelList(ctx);
                try {
                    await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id - 2);
                } catch {
                    /** do nothing */
                }
                try {
                    await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id - 1);
                } catch {
                    /** do nothing */
                }
            } else {
                ctx.reply("Something went wrong while updating channel list")
            }

            adminDefaultSettings();
        } else {
            ctx.reply("**The channel name you entered does not exist. Enter again")
        }
    } else if (addSuccessTransaction && IsAdminLogged) {
        defaultSetting();

        const text = ctx.message.text;

        if (text > 0 && text <= transactionData.length) {
            let result = await db.collection("transactions").findOneAndUpdate({ _id: transactionData[text-1]._id }, {
                $set : {
                    status: "success"
                }
            });

            adminDefaultSettings();

            if (result) {
                ctx.reply("Enter the Transaction Id");
                
                transactionIdMsg = (text);
            } else {
                ctx.reply("**Something went wrong.");
                getPendingTransactionListLast10(ctx)
            }
        } else {
            ctx.reply ("Enter a Valid # id.");
        }
    } else if (addFailedTransaction && IsAdminLogged) {
        defaultSetting();

        const text = ctx.message.text;

        if (text > 0 && text <= transactionData.length) {
            let result = await db.collection("transactions").findOneAndUpdate({ _id: transactionData[text-1]._id }, {
                $set : {
                    status: "failed"
                }
            });

            result = await db.collection("spinsandrefers").updateOne({userId: transactionData[text-1].transactionBy}, {
                $inc : {
                    totalEarnings: transactionData[text-1].amount
                }
            });

            adminDefaultSettings();

            if (result) {
                ctx.reply("Enter the Transaction Failure message");
                
                transactionIdMsg = (text);
            } else {
                ctx.reply("**Something went wrong.");
                getPendingTransactionListLast10(ctx)
            }
        } else {
            ctx.reply ("Enter a Valid # id.");
        }
    } else if (transactionIdMsg && IsAdminLogged) {
        defaultSetting();

        let result = await db.collection("transactions").findOneAndUpdate({ _id: transactionData[transactionIdMsg-1]._id }, {
            $set : {
                failureStatus: ctx.message.text
            }
        });

        if (result) {
            ctx.reply("Transaction Message saved.");
        } else {
            ctx.reply("**Something went wrong.");
        }
        adminDefaultSettings();

        getPendingTransactionListLast10(ctx)
    }
});

bot.action("openAdminMenu", async (ctx) => {
    defaultSetting();
    adminDefaultSettings();

    if (isRunning) {
        return false;
    } else {
        isRunning = true;
    }

    if (IsAdminLogged) {
        adminMenu(ctx);
        resetLogoutTimeOut(ctx);
    } else {
        const result = await db.collection("users").findOne({ u_Id: ctx.chat.id });

        if (result) {
            if (result.type == "1") {
                ctx.reply("Enter your Password to continue");
                IsPassword = true;
            } else {
                ctx.reply("You are not an admin");
            }
        } else {
            ctx.reply("Start game to access this bot", {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Play Game",
                                url: process.env.TELE_WEB_APP_URL
                            }
                        ]
                    ]
                }
            });
        }
    }

    isRunning = false;
});

bot.action("logout", (ctx) => {
    defaultSetting();
    adminDefaultSettings();

    if (isRunning) {
        return false;
    } else {
        isRunning = true;
    }

    if (IsAdminLogged) {
        clearTimeout(resetLogoutTimeOut)
        IsAdminLogged = false;
        ctx.reply("Successfully logged out");
    } else {
        ctx.reply("Your are not logged in.")
    }

    isRunning = false;
})

bot.action("gameSettings", async (ctx) => {
    defaultSetting();
    adminDefaultSettings();

    if (isRunning) {
        return false;
    } else {
        isRunning = true;
    }

    if (IsAdminLogged) {
        resetLogoutTimeOut(ctx);
        gameSettingMenu(ctx);
    } else {
        const result = await db.collection("users").findOne({ u_Id: ctx.chat.id });

        if (result) {
            if (result.type == "1") {
                ctx.reply("Enter your Password to continue");
                IsPassword = true;
            } else {
                ctx.reply("You are not an admin");
            }
        } else {
            ctx.reply("Start game to access this bot", {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Play Game",
                                url: process.env.TELE_WEB_APP_URL
                            }
                        ]
                    ]
                }
            });
        }
    }

    isRunning = false;
});

bot.action("ProfileSetting", async (ctx) => {
    defaultSetting();
    adminDefaultSettings();

    if (isRunning) {
        return false;
    } else {
        isRunning = true;
    }

    if (IsAdminLogged) {
        resetLogoutTimeOut(ctx);
        profileSettingMenu(ctx);
    } else {
        const result = await db.collection("users").findOne({ u_Id: ctx.chat.id });

        if (result) {
            if (result.type == "1") {
                ctx.reply("Enter your Password to continue");
                IsPassword = true;
            } else {
                ctx.reply("You are not an admin");
            }
        } else {
            ctx.reply("Start game to access this bot", {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Play Game",
                                url: process.env.TELE_WEB_APP_URL
                            }
                        ]
                    ]
                }
            });
        }
    }

    isRunning = false;
});

bot.action("channelSettings", async (ctx) => {
    defaultSetting();
    adminDefaultSettings();

    if (isRunning) {
        return false;
    } else {
        isRunning = true;
    }

    if (IsAdminLogged) {
        resetLogoutTimeOut(ctx);
        getChannelList(ctx);
    } else {
        const result = await db.collection("users").findOne({ u_Id: ctx.chat.id });

        if (result) {
            if (result.type == "1") {
                ctx.reply("Enter your Password to continue");
                IsPassword = true;
            } else {
                ctx.reply("You are not an admin");
            }
        } else {
            ctx.reply("Start game to access this bot", {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Play Game",
                                url: process.env.TELE_WEB_APP_URL
                            }
                        ]
                    ]
                }
            });
        }
    }

    isRunning = false;
});

bot.action("changePassword", async (ctx) => {
    defaultSetting();
    adminDefaultSettings();

    if (isRunning) {
        return false;
    } else {
        isRunning = true;
    }

    if (IsAdminLogged) {
        resetLogoutTimeOut(ctx);

        ctx.reply("Enter your new password");
        changePasswordAccess = true;
    } else {
        const result = await db.collection("users").findOne({ u_Id: ctx.chat.id });

        if (result) {
            if (result.type == "1") {
                ctx.reply("Enter your Password to continue");
                IsPassword = true;
            } else {
                ctx.reply("You are not an admin");
            }
        } else {
            ctx.reply("Start game to access this bot", {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Play Game",
                                url: process.env.TELE_WEB_APP_URL
                            }
                        ]
                    ]
                }
            });
        }
    }

    isRunning = false;
});

bot.action("changeWithdrawalAmount", async (ctx) => {
    defaultSetting();
    adminDefaultSettings();

    if (isRunning) {
        return false;
    } else {
        isRunning = true;
    }

    if (IsAdminLogged) {
        resetLogoutTimeOut(ctx);

        ctx.reply("Enter your new Withdrawal amount");
        changeWithdrawalAmountAccess = true;
    } else {
        const result = await db.collection("users").findOne({ u_Id: ctx.chat.id });

        if (result) {
            if (result.type == "1") {
                ctx.reply("Enter your Password to continue");
                IsPassword = true;
            } else {
                ctx.reply("You are not an admin");
            }
        } else {
            ctx.reply("Start game to access this bot", {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Play Game",
                                url: process.env.TELE_WEB_APP_URL
                            }
                        ]
                    ]
                }
            });
        }
    }

    isRunning = false;
});

bot.action("changeDefaultSpins", async (ctx) => {
    defaultSetting();
    adminDefaultSettings();

    if (isRunning) {
        return false;
    } else {
        isRunning = true;
    }

    if (IsAdminLogged) {
        resetLogoutTimeOut(ctx);

        ctx.reply("Enter Default spin amount");
        changeDefaultSpinsAccess = true;
    } else {
        const result = await db.collection("users").findOne({ u_Id: ctx.chat.id });

        if (result) {
            if (result.type == "1") {
                ctx.reply("Enter your Password to continue");
                IsPassword = true;
            } else {
                ctx.reply("You are not an admin");
            }
        } else {
            ctx.reply("Start game to access this bot", {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Play Game",
                                url: process.env.TELE_WEB_APP_URL
                            }
                        ]
                    ]
                }
            });
        }
    }

    isRunning = false
});

bot.action("withdrawalStatus", async (ctx) => {
    defaultSetting();
    adminDefaultSettings();

    if (isRunning) {
        return false;
    } else {
        isRunning = true;
    }

    if (IsAdminLogged) {
        resetLogoutTimeOut(ctx);
        withdrawalStatusMenu(ctx);

        // withdrawalStatusAccess = true;
    } else {
        const result = await db.collection("users").findOne({ u_Id: ctx.chat.id });

        if (result) {
            if (result.type == "1") {
                ctx.reply("Enter your Password to continue");
                IsPassword = true;
            } else {
                ctx.reply("You are not an admin");
            }
        } else {
            ctx.reply("Start game to access this bot", {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Play Game",
                                url: process.env.TELE_WEB_APP_URL
                            }
                        ]
                    ]
                }
            });
        }
    }

    isRunning = false
});

bot.action("enableWithdrawalStatus", async (ctx) => {
    defaultSetting();
    adminDefaultSettings();

    if (isRunning) {
        return false;
    } else {
        isRunning = true;
    }

    if (IsAdminLogged) {
        resetLogoutTimeOut(ctx);
        defaultSetting();

        const result = await db.collection("settings").updateOne({ settingType: "Withdrawal Status" }, {
            $set: {
                settingValue: 1
            },
        }, {
            upsert: true
        })

        if (result) {
            ctx.reply("Withdrawal status is enabled now.")
        } else {
            ctx.reply("Something went wrong while updating withdrawal status");
        }

        withdrawalStatusMenu(ctx);
        adminDefaultSettings();
    } else {
        const result = await db.collection("users").findOne({ u_Id: ctx.chat.id });

        if (result) {
            if (result.type == "1") {
                ctx.reply("Enter your Password to continue");
                IsPassword = true;
            } else {
                ctx.reply("You are not an admin");
            }
        } else {
            ctx.reply("Start game to access this bot", {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Play Game",
                                url: process.env.TELE_WEB_APP_URL
                            }
                        ]
                    ]
                }
            });
        }
    }

    isRunning = false;
})

bot.action("disableWithdrawalStatus", async (ctx) => {
    defaultSetting();
    adminDefaultSettings();

    if (isRunning) {
        return false;
    } else {
        isRunning = true;
    }

    if (IsAdminLogged) {
        resetLogoutTimeOut(ctx);
        defaultSetting();

        const result = await db.collection("settings").updateOne({ settingType: "Withdrawal Status" }, {
            $set: {
                settingValue: 0,
                updatedAt: Date.now()
            },
        }, {
            upsert: true
        })

        if (result) {
            ctx.reply("Withdrawal status is Disabled now.")
        } else {
            ctx.reply("Something went wrong while updating withdrawal status");
        }

        withdrawalStatusMenu(ctx);
        adminDefaultSettings();
    } else {
        const result = await db.collection("users").findOne({ u_Id: ctx.chat.id });

        if (result) {
            if (result.type == "1") {
                ctx.reply("Enter your Password to continue");
                IsPassword = true;
            } else {
                ctx.reply("You are not an admin");
            }
        } else {
            ctx.reply("Start game to access this bot", {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Play Game",
                                url: process.env.TELE_WEB_APP_URL
                            }
                        ]
                    ]
                }
            });
        }
    }

    isRunning = false;
})


bot.action("transactionSetting", async (ctx) => {
    defaultSetting();
    adminDefaultSettings();

    if (isRunning) {
        return false;
    } else {
        isRunning = true;
    }

    if (IsAdminLogged) {
        resetLogoutTimeOut(ctx);
        getPendingTransactionListLast10(ctx);
    } else {
        const result = await db.collection("users").findOne({ u_Id: ctx.chat.id });

        if (result) {
            if (result.type == "1") {
                ctx.reply("Enter your Password to continue");
                IsPassword = true;
            } else {
                ctx.reply("You are not an admin");
            }
        } else {
            ctx.reply("Start game to access this bot", {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Play Game",
                                url: process.env.TELE_WEB_APP_URL
                            }
                        ]
                    ]
                }
            });
        }
    }

    isRunning = false;
});

bot.action("channelList", async (ctx) => {
    defaultSetting();
    adminDefaultSettings();

    if (isRunning) {
        return false;
    } else {
        isRunning = true;
    }

    if (IsAdminLogged) {
        resetLogoutTimeOut(ctx);

        await getChannelList(ctx);
    } else {
        const result = await db.collection("users").findOne({ u_Id: ctx.chat.id });

        if (result) {
            if (result.type == "1") {
                ctx.reply("Enter your Password to continue");
                IsPassword = true;
            } else {
                ctx.reply("You are not an admin");
            }
        } else {
            ctx.reply("Start game to access this bot", {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Play Game",
                                url: process.env.TELE_WEB_APP_URL
                            }
                        ]
                    ]
                }
            });
        }
    }

    isRunning = false;
});

bot.action("addChannel", async (ctx) => {
    defaultSetting();
    adminDefaultSettings();

    if (isRunning) {
        return false;
    } else {
        isRunning = true;
    }

    if (IsAdminLogged) {
        resetLogoutTimeOut(ctx);

        ctx.reply("Enter channel Name ");
        addChannelAccess = true;
    } else {
        const result = await db.collection("users").findOne({ u_Id: ctx.chat.id });

        if (result) {
            if (result.type == "1") {
                ctx.reply("Enter your Password to continue");
                IsPassword = true;
            } else {
                ctx.reply("You are not an admin");
            }
        } else {
            ctx.reply("Start game to access this bot", {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Play Game",
                                url: process.env.TELE_WEB_APP_URL
                            }
                        ]
                    ]
                }
            });
        }
    }

    isRunning = false;
});

bot.action("removeChannel", async (ctx) => {
    defaultSetting();
    adminDefaultSettings();

    if (isRunning) {
        return false;
    } else {
        isRunning = true;
    }

    if (IsAdminLogged) {
        resetLogoutTimeOut(ctx);

        ctx.reply("Enter channel name ");
        removeChannelAccess = true;
    } else {
        const result = await db.collection("users").findOne({ u_Id: ctx.chat.id });

        if (result) {
            if (result.type == "1") {
                ctx.reply("Enter your Password to continue");
                IsPassword = true;
            } else {
                ctx.reply("You are not an admin");
            }
        } else {
            ctx.reply("Start game to access this bot", {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Play Game",
                                url: process.env.TELE_WEB_APP_URL
                            }
                        ]
                    ]
                }
            });
        }
    }

    isRunning = false;
});

bot.action("selectPrimary", async (ctx) => {
    defaultSetting();
    adminDefaultSettings();

    if (isRunning) {
        return false;
    } else {
        isRunning = true;
    }

    if (IsAdminLogged) {
        resetLogoutTimeOut(ctx);

        ctx.reply("Enter Primary Channel name ");
        setPrimaryChannelAccess = true;
    } else {
        const result = await db.collection("users").findOne({ u_Id: ctx.chat.id });

        if (result) {
            if (result.type == "1") {
                ctx.reply("Enter your Password to continue");
                IsPassword = true;
            } else {
                ctx.reply("You are not an admin");
            }
        } else {
            ctx.reply("Start game to access this bot", {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Play Game",
                                url: process.env.TELE_WEB_APP_URL
                            }
                        ]
                    ]
                }
            });
        }
    }

    isRunning = false;
});

bot.action("successTransaction", async (ctx) => {
    defaultSetting();
    adminDefaultSettings();

    if (isRunning) {
        return false;
    } else {
        isRunning = true;
    }

    if (IsAdminLogged) {
        resetLogoutTimeOut(ctx);

        ctx.reply("Enter # id to add success status ");
        addSuccessTransaction = true;
    } else {
        const result = await db.collection("users").findOne({ u_Id: ctx.chat.id });

        if (result) {
            if (result.type == "1") {
                ctx.reply("Enter your Password to continue");
                IsPassword = true;
            } else {
                ctx.reply("You are not an admin");
            }
        } else {
            ctx.reply("Start game to access this bot", {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Play Game",
                                url: process.env.TELE_WEB_APP_URL
                            }
                        ]
                    ]
                }
            });
        }
    }

    isRunning = false;
});

bot.action("failedTransaction", async (ctx) => {
    defaultSetting();
    adminDefaultSettings();

    if (isRunning) {
        return false;
    } else {
        isRunning = true;
    }

    if (IsAdminLogged) {
        resetLogoutTimeOut(ctx);

        ctx.reply("Enter # id to add failed status ");
        addFailedTransaction = true;
    } else {
        const result = await db.collection("users").findOne({ u_Id: ctx.chat.id });

        if (result) {
            if (result.type == "1") {
                ctx.reply("Enter your Password to continue");
                IsPassword = true;
            } else {
                ctx.reply("You are not an admin");
            }
        } else {
            ctx.reply("Start game to access this bot", {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Play Game",
                                url: process.env.TELE_WEB_APP_URL
                            }
                        ]
                    ]
                }
            });
        }
    }

    isRunning = false;
});

const adminMenu = async (ctx) => {
    if (IsAdminLogged) {
        resetLogoutTimeOut(ctx);
        ctx.telegram.sendMessage(ctx.chat.id, '<b>Admin Settings: </b>', {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Game Settings",
                            callback_data: "gameSettings"
                        }
                    ],
                    [
                        {
                            text: "Profile Setting",
                            callback_data: "ProfileSetting"
                        }
                    ],
                    [
                        {
                            text: "Channel Settings",
                            callback_data: "channelSettings"
                        }
                    ],
                    [
                        {
                            text: "Logout",
                            callback_data: "logout"
                        }
                    ]
                ]
            }
        })
    } else {
        const result = await db.collection("users").findOne({ u_Id: ctx.chat.id });

        if (result) {
            if (result.type == "1") {
                ctx.reply("Enter your Password to continue");
                IsPassword = true;
            } else {
                ctx.reply("You are not an admin");
            }
        } else {
            ctx.reply("Start game to access this bot", {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Play Game",
                                url: process.env.TELE_WEB_APP_URL
                            }
                        ]
                    ]
                }
            });
        }
    }
}

const profileSettingMenu = async (ctx) => {
    if (IsAdminLogged) {
        resetLogoutTimeOut(ctx);
        ctx.telegram.sendMessage(ctx.chat.id, '<b>Profile Setting: </b>', {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Change Password",
                            callback_data: "changePassword"
                        }
                    ],
                    [
                        {
                            text: "Go Back",
                            callback_data: "openAdminMenu"
                        }
                    ]
                ]
            }
        })
    } else {
        const result = await db.collection("users").findOne({ u_Id: ctx.chat.id });

        if (result) {
            if (result.type == "1") {
                ctx.reply("Enter your Password to continue");
                IsPassword = true;
            } else {
                ctx.reply("You are not an admin");
            }
        } else {
            ctx.reply("Start game to access this bot", {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Play Game",
                                url: process.env.TELE_WEB_APP_URL
                            }
                        ]
                    ]
                }
            });
        }
    }
}

const gameSettingMenu = async (ctx) => {
    if (IsAdminLogged) {
        resetLogoutTimeOut(ctx);
        ctx.telegram.sendMessage(ctx.chat.id, '<b>Game Settings: </b>', {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Change Withdrawal Amount",
                            callback_data: "changeWithdrawalAmount"
                        }
                    ],
                    [
                        {
                            text: "Change Default spins",
                            callback_data: "changeDefaultSpins"
                        }
                    ],
                    [
                        {
                            text: "Withdrawal Status",
                            callback_data: "withdrawalStatus"
                        }
                    ],
                    [
                        {
                            text: "Transactions",
                            callback_data: "transactionSetting"
                        }
                    ],
                    [
                        {
                            text: "Go Back",
                            callback_data: "openAdminMenu"
                        }
                    ]
                ]
            }
        });
    } else {
        const result = await db.collection("users").findOne({ u_Id: ctx.chat.id });

        if (result) {
            if (result.type == "1") {
                ctx.reply("Enter your Password to continue");
                IsPassword = true;
            } else {
                ctx.reply("You are not an admin");
            }
        } else {
            ctx.reply("Start game to access this bot", {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Play Game",
                                url: process.env.TELE_WEB_APP_URL
                            }
                        ]
                    ]
                }
            });
        }
    }
}

const withdrawalStatusMenu = async (ctx) => {
    if (IsAdminLogged) {
        resetLogoutTimeOut(ctx);
        ctx.telegram.sendMessage(ctx.chat.id, '<b>Select Withdrawal Status: </b>', {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Enabled",
                            callback_data: "enableWithdrawalStatus"
                        }
                    ],
                    [
                        {
                            text: "Disabled",
                            callback_data: "disableWithdrawalStatus"
                        }
                    ],
                    [
                        {
                            text: "Go Back",
                            callback_data: "gameSettings"
                        }
                    ]
                ]
            }
        });
    } else {
        const result = await db.collection("users").findOne({ u_Id: ctx.chat.id });

        if (result) {
            if (result.type == "1") {
                ctx.reply("Enter your Password to continue");
                IsPassword = true;
            } else {
                ctx.reply("You are not an admin");
            }
        } else {
            ctx.reply("Start game to access this bot", {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Play Game",
                                url: process.env.TELE_WEB_APP_URL
                            }
                        ]
                    ]
                }
            });
        }
    }
}

/** Custom functions */
async function createChannelListTable(channelData) {
    const idWidth = 4;
    const nameWidth = 22;
    const typeWidth = 5;
    const addedByWidth = 22;

    let table = '';

    table += `#${' '.repeat(idWidth)}Name${' '.repeat(nameWidth - 'Name'.length)}Added By${' '.repeat(addedByWidth - 'Added By'.length)}Type\n`;
    table += '-'.repeat(idWidth + nameWidth + addedByWidth + typeWidth + 3) + '\n';  // Adjust separator length

    let i = 1;
    for (const channel of channelData) {
        // Fetch the user details
        const user = await db.collection("users").findOne({ u_Id: channel.createdBy });

        // Handle case where user is not found
        const addedByName = user ? user.name : 'Unknown';

        const chType = (channel.type == 1 ? "Primary" : "Secondary")

        // Append channel information to table
        table += `${i.toString().padEnd(idWidth)}@${channel.username.padEnd(nameWidth)}${addedByName.padEnd(addedByWidth)}${chType.padEnd(typeWidth)}\n`;
        i++;
    }

    return table;
}

async function getChannelList(ctx) {
    const result = await db.collection("channels").find({}).toArray();

    if (result.length > 0) {
        const channelListTable = await createChannelListTable(result);

        ctx.reply(`\`\`\`\n${channelListTable}\n\`\`\``, {
            parse_mode: 'MarkdownV2', reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "add",
                            callback_data: "addChannel"
                        },
                        {
                            text: "Remove",
                            callback_data: "removeChannel"
                        }
                    ],
                    [
                        {
                            text: "Select Primary",
                            callback_data: "selectPrimary"
                        }
                    ],
                    [
                        {
                            text: "Go Back",
                            callback_data: "openAdminMenu"
                        }
                    ]
                ]
            }
        });
    } else {
        ctx.reply("No channel found", {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "add",
                            callback_data: "addChannel"
                        }
                    ],
                    [
                        {
                            text: "Go Back",
                            callback_data: "openAdminMenu"
                        }
                    ]
                ]
            }
        });
    }
}

async function createPendingTransactionListLast10Table(transactionData) {

    const ID_WIDTH = 4;//
    const STATUS_WIDTH = 10;//
    const TRANSACTION_BY_WIDTH = 15;//
    const UPI_ID_WIDTH = 15;//
    const AMOUNT_WIDTH = 10;//
    const TABLE_BORDER_CHAR = '-';

    // Adjust separator width according to new column widths
    const TABLE_SEPARATOR_WIDTH = ID_WIDTH + UPI_ID_WIDTH + AMOUNT_WIDTH + STATUS_WIDTH + TRANSACTION_BY_WIDTH + 5;

    let table = '';

    // Header row
    table += `#${' '.repeat(ID_WIDTH)}UPI ID${' '.repeat(UPI_ID_WIDTH - 'UPI ID'.length)}Amount${' '.repeat(AMOUNT_WIDTH - 'Amount'.length)}Status${' '.repeat(STATUS_WIDTH - 'Status'.length)}Transaction by\n`;
    table += TABLE_BORDER_CHAR.repeat(TABLE_SEPARATOR_WIDTH) + '\n';

    let i = 1;
    for (const transaction of transactionData) {
        try {
            // Fetch user details
            const dataX = await db.collection("users").findOne({_id: new ObjectId(transaction.transactionBy)});

            let userName;

            if (dataX) {
                userName = dataX.name 
            } else {
                userName = "Unknown"
            }

            // Append transaction information to scltable
            table += `${i.toString().padEnd(ID_WIDTH)}${transaction.upiId.toString().padEnd(UPI_ID_WIDTH)}${transaction.amount.toString().padEnd(AMOUNT_WIDTH)}${transaction.status.toString().padEnd(STATUS_WIDTH)}${userName.toString().padEnd(TRANSACTION_BY_WIDTH)}\n`;
            i++;
        } catch (error) {
            console.error('Error fetching user details:', error);
            table += `${i.toString().padEnd(ID_WIDTH)}${transaction.upiId.toString().padEnd(UPI_ID_WIDTH)}${transaction.amount.toString().padEnd(AMOUNT_WIDTH)}${transaction.status.toString().padEnd(STATUS_WIDTH)}Unknown\n`;
            i++;
        }
    }

    return table;
}

async function getPendingTransactionListLast10(ctx) {
    const result = await db.collection("transactions").find({ status: "pending" }).sort({ createdAt: 1 }).limit(5).toArray();

    if (result.length > 0) {
        transactionData = result;
        const transactionList = await createPendingTransactionListLast10Table(result);

        ctx.reply(`\`\`\`\n${transactionList}\n\`\`\``, {
            parse_mode: 'MarkdownV2',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "Success", callback_data: "successTransaction" },
                        { text: "Failed", callback_data: "failedTransaction" }
                    ],
                    [
                        { text: "Go Back", callback_data: "gameSettings" }
                    ]
                ]
            }
        });
    } else {
        ctx.reply("No Pending Transaction found", {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Go Back",
                            callback_data: "gameSettings"
                        }
                    ]
                ]
            }
        });
    }
}

bot.launch().then(() => {
    console.log('Bot is up and running...');
});