const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema with validation
const transactionSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [3, 'Name must be at least 3 characters long'],
        maxlength: [20, 'Name must be less than 20 characters long']
    },
    upiId: {
        type: String,
        required: [true, 'UPI ID is required'],
        trim: true,
        match: [/^[\w\.-]+@[\w\.-]+$/, 'Please fill a valid UPI ID']
    },
    amount: {
        type: Number,
        required: [true, 'Withdrawal amount is required']
    },
    transactionBy: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        default: 'pending'
    },
    failureStatus: {
        type: String,
        trim: true,
        default: null,
        maxlength: [200, 'Failure status must be less than 200 characters long']
    }
},
    {
        timestamps: true,
    }
);

// Create the model from the schema
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;