const userModel = require("./models/user");
const {createUserGameData, removeUserGameData} = require("../game/gameData")
const unregisterUser = require("./unregister");

const registerNewUser = async (name, email, mobileNumber, password, referralBy) => {
  /** Registration Logic */
  try {
    const findUserWithEmail = await userModel.findOne({ email });
    const findUserWithMobile = await userModel.findOne({ mobileNumber });

    if (!findUserWithEmail && !findUserWithMobile) {
      const user = new userModel({
        name,
        email,
        mobileNumber,
        password,
      });

      const result = await user.save();
      if (result) {
        const result2 = await createUserGameData(result._id, referralBy);

        if (result2.type == 1) {
          _success = {
            message: "Successfully registered",
            type: 1,
            userDetail: result
          }
    
          return _success;
        } else {
          await unregisterUser(email);
          throw new Error("Something went wrong");
        }
      }
    } else {
      throw new Error("User already registered with the email or number");
    }
  } catch (error) {
    return error;
  }
};

module.exports = registerNewUser;
