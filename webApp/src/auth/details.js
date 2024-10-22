const userModel = require("./models/user");
const gameDataModel = require("../game/models/spinAndRefer");
const {gameData} = require("../game/gameData");

const userDetails = async (userId) => {
  try {
    const findUserDetails = await userModel.findById(userId);

    if (findUserDetails) {
      const _success = {
        message: "Details found",
        type: 1,
        userDetail: findUserDetails,
      }

      const findUserGameData = await gameData(userId);
      if (findUserGameData) {
        _success.userGameData = findUserGameData;
      }

      return _success;
    } else {
      throw new Error("Unknown user");
    }
  } catch (error) {
    return error;
  }
};

module.exports = userDetails;
