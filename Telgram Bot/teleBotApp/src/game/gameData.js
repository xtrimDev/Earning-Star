const gameDataModel = require("../game/models/spinAndRefer");
const userModel = require("../auth/models/user");

const generateUniqueString = require("../functions/generateUniqueString");
const {DefaultSpins} = require("../bot/getSettings");

const gameData = async (userId) => {
    try {
        const userGameData = await gameDataModel.findOne({ userId });

        if (userGameData) {
            _success = {
                message: "User Game Data found",
                type: 1,
                userGameData
            }

            return _success;
        } else {
            throw new Error("Unknown user.");
        }
    } catch (error) {
        return error;
    }
};

const createUserGameData = async (userId, referralBy) => {
    try {
        let referralCode = '';
        while (1) {
            referralCode = generateUniqueString(6);

            const result = await gameDataModel.findOne({ referralCode });

            if (!result) {
                break;
            }
        }

        const spinAmt = await DefaultSpins();
        const userGameData = new gameDataModel({
            userId,
            referralCode,
            spinsAvailable: parseInt(spinAmt)
        });

        if (referralBy && referralBy.trim().length == 6) {
            const findUser = await gameDataModel.findOne({ referralCode: referralBy.trim() });

            if (findUser) {
                const updateReferredByUser = await gameDataModel.updateOne({ _id: findUser._id }, { $push: { referredUsers: { userId: userId } } });

                userGameData.referredBy = referralBy
            }
        }

        const result = await userGameData.save();

        _success = {
            message: "User Game Data Created",
            type: 1,
            userDetail: result
        }

        return _success;
    } catch (error) {
        return error;
    }
}

const removeUserGameData = async (userId) => {
    try {
        const findUserData = await gameDataModel.findOne({ userId });

        if (findUserData) {
            const result = await gameDataModel.deleteOne({ userId });

            _success = {
                message: "User Data successfully removed",
                type: 1,
                userDetail: result
            }

            return _success;
        } else {
            throw new Error("Unknown user");
        }
    } catch (error) {
        return error;
    }
};

const gamePlayed = async (userId, earned) => {

    try {
        const result = await gameDataModel.updateOne({ userId }, { $inc: { totalEarnings: earned, spinsAvailable: -1 } });

        const _success = {
            message: "Game data updated",
            type: 1,
            userGameData: result
        }

        return _success;
    } catch (error) {
        return error;
    }
}

const referredCheck = async (userId) => {

    try {
        const result = await userModel.findOne({ _id : userId });

        const _success = {
            message: "Game data updated",
            type: 1,
            fetchedData: result
        }

        return _success;
    } catch (error) {
        console.log(error);
        return false;
    }
}

module.exports = { gameData, createUserGameData, removeUserGameData, gamePlayed,referredCheck };
