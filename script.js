const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const path = require('path');

const app = express();
const port = 3000;

// Connect to MongoDB (replace 'your_mongodb_uri' with your actual MongoDB URI)
mongoose.connect('mongodb://127.0.0.1:27017/banktrans', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
  console.log('Connected to MongoDB');
});

// Define a MongoDB model for the transaction
const Transaction = mongoose.model('Transaction', {
  amount: Number,
  timestamp: { type: Date, default: Date.now },
  transactionId: {
    type: String,
    required: true,
    unique: true,
  }
});

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse JSON
app.use(bodyParser.json());

// Serve your HTML, CSS, and JS files
app.use(express.static('public'));

// Redirect from root path to /qr
app.get('/', (req, res) => {
  // Redirect to the '/qr' route
  res.redirect('/qr');
});

// API endpoint to handle the amount submission
app.post('/payment', (req, res) => {
  const amount = req.body.amount;

  // Validate the amount (add more validation if needed)
  if (!amount || isNaN(amount)) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  // Create a new transaction and save it to MongoDB
  newTransaction.save((err) => {
    if (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // Redirect to the '/qr' route
    res.redirect('/qr');
  });
});

// Route handler for /qr
app.get('/qr', (req, res) => {
  console.log('Accessed /qr route');
  res.render('qr', { message: 'Transaction stored successfully' });
});
app.get('/views/payment', (req, res) => {
  // Render your payment page or perform other actions
  res.render('payment');
});

app.get('/views/payment', (req, res) => {
  // Render your payment page and pass the necessary variables
  res.render('payment', { transactionId, currentDate, amount });
});




// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});