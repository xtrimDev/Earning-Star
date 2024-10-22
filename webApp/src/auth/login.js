const userModel = require("./models/user");
const bcrypt = require("bcrypt");

const loginUser = async (email, password) => {
  /** Login Logic */
  try {
    const result = await userModel.findOne({ email });

    if (!result) {
      throw new Error("Email is not Registered.");
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, result.password);

    if (isPasswordMatch) {
      if (result.verified == true) {
        _success = {
          message: "Successfully Logged in",
          type: 1,
          userDetail: result
        }
  
        return _success;
      } else {        
        throw new Error(`not-verified ${result._id}`);
      }      
    } else {
      throw new Error("Password do not match");
    }
  } catch (error) {
    return error;
  }
}

module.exports = loginUser;