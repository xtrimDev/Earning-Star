const userModel = require("./models/user");
const bcrypt = require("bcrypt");

const registerNewUser = async (userId, password) => {
  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);

  try {
    const user = await userModel.findById(userId);

    if (user) {
        const result = await userModel.updateOne({ _id: userId }, { $set: { password: password } });

        _success = {
            message: "Successfully Password Changed",
            type: 1,
            userDetail: result
          }

          return _success;
    } else {
      throw new Error("Invalid User");
    }
  } catch (error) {
    return error;
  }
};

module.exports = registerNewUser;
