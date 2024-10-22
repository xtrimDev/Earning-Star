const userModel = require("./models/user");

const unregister = async (email) => {
  try {
    const findUserWithEmail = await userModel.findOne({ email });

    if (findUserWithEmail) {
      const user = {
        email
      };

      const result = await userModel.deleteOne(user);

      _success = {
        message: "User successfully removed",
        type: 1,
        userDetail: result
      }

      return _success;
    } else {
      throw new Error("User is not registered with the email");
    }
  } catch (error) {
    return error;
  }
};

module.exports = unregister;
