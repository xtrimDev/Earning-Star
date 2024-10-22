const transaction = require("./models/transaction");
const gameModel = require("./models/spinAndRefer");
const userModel = require("../auth/models/user");

const bcrypt = require("bcrypt");

const withdraw = async (amount, name, upiId, transactionBy, password) => {
    try {
        const result = await userModel.findById(transactionBy);

        if (!result) {
            throw new Error("user is invalid");
        }

        // Compare passwords
        const isPasswordMatch = await bcrypt.compare(password, result.password);

        if (isPasswordMatch) {
            const userGameData = await gameModel.findOne({userId: transactionBy});

            if (userGameData && userGameData.totalEarnings >= amount) {
                if (result.verified == true) {
                    const newTrans = new transaction({
                        amount,
                        name,
                        upiId,
                        transactionBy,
                    });

                    await newTrans.save();

                    await gameModel.updateOne({ userId: transactionBy }, { $inc: { totalEarnings: -amount } });

                    _success = {
                        message: "Withdrawal successful",
                        type: 1,
                        userDetail: result
                    }

                    return _success;
                } else {
                    throw new Error(`user is invalid`);
                }
            } else {
                throw new Error ("Entered amount is greater than your balance");
            }
        } else {
            throw new Error("Password do not match");
        }
    } catch (error) {
        return error;
    }
};

const withdrawHistory = async (userId) => {
    try {
        const result = await transaction.find({ transactionBy: userId }).sort({ createdAt: -1 }).select("upiId amount status failureStatus createdAt");
        
        return result;
    } catch (error) {
        return error;
    }
};

module.exports = { withdraw, withdrawHistory };
