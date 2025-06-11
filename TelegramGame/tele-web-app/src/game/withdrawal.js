const transaction = require("./models/transaction");
const gameModel = require("./models/spinAndRefer");
const userModel = require("../auth/models/user");

const withdraw = async (amount, name, upiId, transactionBy) => {
    try {
        const result = await userModel.findById(transactionBy);

        if (!result) {
            throw new Error("user is invalid");
        }

        const userGameData = await gameModel.findOne({userId: transactionBy});

        if (userGameData && userGameData.totalEarnings >= amount) {
            const newTrans = new transaction({
                amount,
                name,
                upiId,
                transactionBy,
            });

            if ((res = await newTrans.save())) {
                if (await gameModel.updateOne({ userId: transactionBy }, { $inc: { totalEarnings: -amount } })){
                    _success = {
                        message: "Withdrawal successful",
                        type: 1,
                        userDetail: result
                    }
    
                    return _success;
                } else {
                    await transaction.findByIdAndDelete(res._id);
                }
            }
        } else {
            throw new Error ("Entered amount is greater than your balance");
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
