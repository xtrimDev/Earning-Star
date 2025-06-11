const mongoose = require('mongoose');
const { Schema } = mongoose;

const channelSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true 
    },
    createdBy: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        default: 0,
        required: true 
    }
}, {
    timestamps: true
});


const channels = mongoose.model('channels', channelSchema);

module.exports = channels;
