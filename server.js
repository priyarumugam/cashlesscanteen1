const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const BankingDetails = require('./models/bankingDetailsModel'); // Import the model

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/bookingApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Serve static files from the public directory
app.use(express.static('public'));

// Render the banking details form
app.get('/', (req, res) => {
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
      !email||
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});