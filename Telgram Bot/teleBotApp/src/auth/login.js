const userModel = require("./models/user");
const gameDataModel = require("../game/models/spinAndRefer");

const loginUser = async (userId) => {
  /** Login Logic */
  try {
    const result = await userModel.findOne({ u_Id: userId });

    if (result) {
      const _success = {
        message: "User logged in successfully",
        type: 1,
        userDetail: result
      }

      return _success;
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    return error;
  }
}

module.exports = loginUser;