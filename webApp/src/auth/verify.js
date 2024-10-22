const userModel = require("./models/user");
const verificationModel = require("./models/verification");
const gameDataModel = require("../game/models/spinAndRefer");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const verifyUser = async (userId, uniqueString, shouldVerified = 1) => {
  try {
    if (mongoose.Types.ObjectId.isValid(userId) && userId.length === 24) {
      const findUser = await userModel.findById(userId);

      if (findUser && !findUser.verified || !shouldVerified) {
        
        const findVerificationOfUser = await verificationModel.findOne({ userId });

        if (findVerificationOfUser) {
          const isUniqueStringMatched = await bcrypt.compare(uniqueString, findVerificationOfUser.uniqueString);

          if (isUniqueStringMatched && findVerificationOfUser.expiresAt > Date.now()) {
            const userGameData = await gameDataModel.findOne({userId});
            
            if (userGameData.referredBy) {
              const result = await gameDataModel.updateOne({ 'referredUsers.userId': userId }, { $set: { 'referredUsers.$.UserActivation': true }, $inc: { spinsAvailable: 1 }});
            }
            
            const result = await userModel.updateOne({ _id: userId }, { $set: { verified: true } });

            if (shouldVerified) {
              const result2 = await verificationModel.deleteOne({userId});
            }
            
            const _success = {
              message: "Verification completed",
              type: 1,
              userData: result
            }

            return _success;
          } else {
            throw new Error("The link is expired or Invalid");
          }
        } else {
          throw new Error("The link is expired or Invalid");
        }
      } else {
        throw new Error("The link is expired or Invalid");
      }
    } else {
        throw new Error("The link is expired or Invalid");
      }
  } catch (error) {
    return error;
  }
};

const createVerifyUser = async (userId, uniqueString, expiresAt) => {
  try {
    const userVerificationDetails = new verificationModel({
      userId,
      uniqueString,
      expiresAt
    });

    const result = await userVerificationDetails.save();

    _success = {
      message: "User Verification Details Saved",
      type: 1,
      userDetail: result
    }

    return _success;
  } catch (error) {
    return error;
  }
}

const removeVerifyUser = async (userId) => {
  try {
    const findUser = await verificationModel.findOne({ userId });

    if (findUser) {
      const user = {
        userId
      };

      const result = await verificationModel.deleteOne(user);

      _success = {
        message: "User verification details removed",
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
}

module.exports = { verifyUser, createVerifyUser, removeVerifyUser };
