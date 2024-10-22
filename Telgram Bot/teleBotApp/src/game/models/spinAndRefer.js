const mongoose = require('mongoose');
require("dotenv").config();

const spinAndReferSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true
        },
        referralCode: {
            type: String,
            required: true,
            unique: true
        },
        referredBy: {
            type: String,
        },
        referredUsers: [{
            userId: {
                type: String,
                required: true
            },
            UserTaskComplete: {
                type: Boolean,
                default: false,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now,
                required: true
            }
        }],
        spinsAvailable: {
            type: Number,
            min: 0
        },
        totalEarnings: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('spinsAndRefer', spinAndReferSchema);
