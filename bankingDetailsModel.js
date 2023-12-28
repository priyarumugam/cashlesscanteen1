const mongoose = require('mongoose');

const bankingDetailsSchema = new mongoose.Schema({
  accountHolderName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  ifscCode: { type: String, required: true },
  bankName: { type: String, required: true },
  email: { type: String },
  phoneNumber: { type: String, required: true },
});

const BankingDetails = mongoose.model('BankingDetails', bankingDetailsSchema);

module.exports = BankingDetails;