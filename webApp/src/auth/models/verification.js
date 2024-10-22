const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userVerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    uniqueString: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Automatically delete expired documents
userVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); 

// Hash uniqueString before saving to the database
userVerificationSchema.pre("save", async function (next) {
  if (this.isModified("uniqueString") || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.uniqueString = await bcrypt.hash(this.uniqueString, salt);
  }
  next();
});

module.exports = mongoose.model("User Verification", userVerificationSchema);