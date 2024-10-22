const userModel = require("./models/user");
require("dotenv").config();
const bcrypt = require('bcrypt');

const registerNewUser = async (u_Id, name, username) => {
  try {
    const findByU_Id = await userModel.findOne({ u_Id });

    if (!findByU_Id) {
      let res = await userModel.estimatedDocumentCount();

      let password = false;
      let type = 0;

      if (res == 0) {
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASS, salt);

        type = 1;
      }

      const userData = new userModel({
        u_Id,
        name,
        username,
        password,
        type,
        referredDone: false
      });

      const result = await userData.save();

      if (result) {
        const _success = {
          message: "Successfully registered",
          type: 1,
          userData : result
        }

        return _success;
      } else {
        throw new Error ("something went wrong");
      }
    } else {
      throw new Error ("user already exists");
    }
  } catch (error) {
    return error;
  }
};

const unregister = async (u_Id) => {
  try {
    const findUserWithU_Id = await userModel.findOne({ u_Id });

    if (findUserWithU_Id) {
      const user = {
        u_Id
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

module.exports = {registerNewUser, unregister};
