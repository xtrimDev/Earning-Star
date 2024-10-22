const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    u_Id: {
      type: Number,
      required: true,
      unique: true,
      trim: true,
    },
    
    name: {
      type: String,
      required: true,
      trim: true
    },

    username: {
      type: String,
      trim: true
    },
    taskComplete: [{
      channelName: {
          type: String,
      }
    }, {
      timestamps: true
    }],
    type: {
      type: Number,
      default: 0
    },
    password: {
      type: String,
      default: false
    },
    referredDone: {
      type: Boolean,
      default: false,
      required: true
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
