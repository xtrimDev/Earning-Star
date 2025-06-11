const mongoose = require('mongoose');
const { Schema } = mongoose;

const settingsSchema = new Schema({
  settingType: {
    type: String,
    required: true,
    unique: true,
    enum: ['Withdrawal Amount', 'Default spins', 'Withdrawal Status'] 
  },
  settingValue: {
    type: Schema.Types.Mixed, 
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now 
  }
});

settingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
