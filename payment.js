const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const uuid = require('uuid');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/scanner', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define the user schema
const userSchema = new mongoose.Schema({
  name: String,
  password: String,
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Define the payment schema
const paymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
});

// Create a model based on the payment schema
const Payment = mongoose.model('Payment', paymentSchema);

// Home route
app.get('/', (req, res) => {
  res.redirect('/qr');
});

// Login routes

// Render the banking details form
app.get('/bankingDetails', (req, res) => {
  res.render('bankingDetails'); // Change 'booking' to 'bankingDetails'
});

// Handle form submission
app.post('/api/save-banking-details', async (req, res) => {
  const {
    accountHolderName,
    accountNumber,
    ifscCode,
    bankName,
    email,
    phoneNumber,
  } = req.body;

  console.log('Received form data:', req.body);

  try {
    // Check if required fields are provided
    if (
      !accountHolderName ||
      !accountNumber ||
      !ifscCode ||
      !bankName ||
      !email ||
      !phoneNumber
    ) {
      throw new Error('All required fields must be provided.');
    }

    // Create a new object with the required fields
    const newBankingDetails = {
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      email,
      phoneNumber,
    };

    // Save the banking details to MongoDB
    const savedBankingDetails = await BankingDetails.create(newBankingDetails);
    console.log('Banking details saved:', savedBankingDetails);

    // Send success response
    res.status(200).json({ message: 'Banking details added successfully!' });
  } catch (err) {
    console.error('Error adding banking details:', err);
    res.status(500).json({ message: 'Error adding banking details.' });
  }
});

// Render the QR view
app.get('/qr', (req, res) => {
  res.render('qr'); // Assuming you have a qr.ejs file
});

// Render the payment page
app.get('/payment', async (req, res) => {
    try {
      // Assuming you want to get the latest payment
      const latestPayment = await Payment.findOne().sort({ _id: -1 }).exec();
  
      if (!latestPayment) {
        return res.status(404).json({ message: 'No payment found' });
      }
  
      const currentDate = new Date().toLocaleDateString();
      const transactionId = latestPayment._id; // Use the _id field as transactionId
      const amountPaid = latestPayment.amount;
  
      res.render('payment', { currentDate, transactionId, amountPaid });
    } catch (error) {
      console.error('Error fetching payment details from MongoDB:', error);
      res.status(500).json({ message: 'Error fetching payment details from MongoDB.' });
    }
  });
  
  // Route for handling payment form submission
  app.post('/payment', async (req, res) => {
    try {
      const amount = req.body.amount;
  
      if (!amount) {
        return res.status(400).json({ message: 'Amount is required' });
      }
  
      // Create a new payment document
      const newPayment = new Payment({ amount });
  
      // Save the payment to the 'Payment' collection within the 'banktrans' database
      await newPayment.save(async (error, savedPayment) => {
        if (error) {
          console.error('Error saving payment to MongoDB:', error);
          return res.status(500).json({ message: 'Error saving payment to MongoDB.' });
        }
  
        // Generate a unique transaction ID using uuid
        const transactionId = savedPayment._id; // Use the saved payment ID
        const currentDate = new Date().toLocaleDateString();
        const amountPaid = savedPayment.amount; // Use the saved payment amount
        res.render('payment', { currentDate, transactionId, amountPaid });
      });
    } catch (error) {
      console.error('Error generating transaction details or saving payment to MongoDB:', error);
      res.status(500).json({ message: 'Error generating transaction details or saving payment to MongoDB.' });
    }
  });
  


// Home route
app.get('/home', (req, res) => {
  res.render('home');
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
