import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    planId: {type: String, required: true},
    amount: {type: Number, required: true},
    credits: {type: Number, required: true},
    isPaid: {type: Boolean, default: false},
    
}, {timestamps: true})

const transactionModel = mongoose.model('transaction', transactionSchema);

export default transactionModel;