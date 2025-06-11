const userModel = require("./models/user");
const gameDataModel = require("../game/models/spinAndRefer");
const {gameData} = require("../game/gameData");

const userDetails = async (email) => {
  try {
    const findUserDetails = await userModel.findOne({email});

    if (findUserDetails) {
      const _success = {
        message: "Details found",
        type: 1,
        userDetail: findUserDetails
      }

      const findUserGameData = await gameData(findUserDetails._id);
      if (findUserGameData) {
        _success.GameData = findUserGameData;
      }

      return _success;
    } else {
      throw new Error("Email is not registered.");
    }
  } catch (error) {
    return error;
  }
};

module.exports = userDetails;
