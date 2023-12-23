const mongoose = require('mongoose');

const bankingDetailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  accountHolderName: String,
  accountNumber: String,
  ifscCode: String,
  bankName: String,
  email: String,
  phoneNumber: String,
});

module.exports = mongoose.model('BankingDetails', bankingDetailsSchema);