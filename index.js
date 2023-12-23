const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const uuid = require('uuid');
const QRCode = require('qrcode');
const { createReadStream } = require('fs');
const { createInterface } = require('readline');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

// MongoDB connection setup
mongoose.connect("mongodb://127.0.0.1:27017/scanner", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Define the user schema
const userSchema = new mongoose.Schema({
  name: String,
  password: String,
});

// Create the User model
const User = mongoose.model("User", userSchema);

// Define the banking details schema and model
const BankingDetailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  accountHolderName: String,
  accountNumber: String,
  ifscCode: String,
  bankName: String,
  email: String,
  phoneNumber: String,
});

const BankingDetails = mongoose.model('BankingDetails', BankingDetailsSchema);

// Define the payment schema
const PaymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
});

// Create a model based on the payment schema
const Payment = mongoose.model("Payment", PaymentSchema);

// Home route
app.get("/", (req, res) => {
  res.render("home");
});

// Login routes
app.get("/login", (req, res) => {
  res.render("login", { errorMessage: null });
});

app.post("/login", async (req, res) => {
  try {
    const username = req.body.username;
    const user = await User.findOne({ name: username.toLowerCase() });

    if (!user) {
      console.log("Username not found:", username);
      return res.render("login", { errorMessage: "Username not found" });
    }

    const inputPassword = req.body.password;
    const storedPassword = user.password;

    console.log('Input Password:', `'${inputPassword}' (length: ${inputPassword.length})`);
    console.log('Stored Password:', `'${storedPassword}' (length: ${storedPassword.length})`);

    // Trim the input password before comparing
    if(inputPassword === storedPassword) {
      res.redirect("/customerlink"); // Redirect to home page after successful login
    } else {
      console.log("Wrong password for username:", username);
      res.render("login", { errorMessage: "Wrong password" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.render("error", { errorMessage: "An error occurred. Please try again." });
  }
});

// Customer link route
app.get("/customerlink", (req, res) => {
  res.render("customerlink");
});

// Banking details form route
app.get("/bankDetails", (req, res) => {
  res.render("bankDetails");
});


// Handle banking details form submission
app.post("/api/bankDetails", async (req, res) => {
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

    // Assuming you have user authentication and a logged-in user
    const userId = "exampleUserId"; // Replace with your authentication logic

    // Create a new object with the required fields
    const newBankingDetails = {
      userId,
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

// QR route
app.get("/qr", (req, res) => {
  res.render("qr");
});


app.get("/pay", (req, res) => {
  res.render("pay", { errorMessage: null });
});

// Add this route to handle "/view/pay" as well
app.get("/views/pay", (req, res) => {
  res.render("pay", { errorMessage: null });
});
app.get("/qr", (req, res) => {
  res.render("qr", { errorMessage: null });
});
// Handle QR form submission
app.post("/api/qr", async (req, res) => {
  try {
    const amount = req.body.amount;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    // Create a new payment document
    const newPayment = new Payment({ amount });

    // Save the payment to the 'Payment' collection
    await newPayment.save();

    // Redirect to the QR code generation page
    res.redirect("/qr");
  } catch (error) {
    console.error('Error saving payment to MongoDB:', error);
    res.status(500).json({ message: 'Error saving payment to MongoDB.' });
  }
});

// QR code generation route
app.get("/generateQR/:amount", async (req, res) => {
  try {
    const amount = req.params.amount;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    // Generate QR code
    const qrCodeBuffer = await QRCode.toBuffer(`Amount: ${amount}`);

    // Set response headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'inline; filename=qr-code.png');

    // Send QR code as response
    res.send(qrCodeBuffer);
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ message: 'Error generating QR code.' });
  }
});

// Scanning route
app.get("/scanning", (req, res) => {
  res.render("qr"); // Assuming scanning logic is included in the 'qr.ejs' page
});

// Payment route
app.get("/payment", (req, res) => {
  res.render("payment");
});

// Handle payment form submission
app.post("/api/payment", async (req, res) => {
  try {
    const amount = req.body.amount;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    // Create a new payment document
    const newPayment = new Payment({ amount });

    // Save the payment to the 'Payment' collection
    await newPayment.save();

    // Send success response
    res.status(200).json({ message: 'Payment details added successfully!' });
  } catch (err) {
    console.error('Error adding payment details:', err);
    res.status(500).json({ message: 'Error adding payment details.' });
  }
});

// Payment details route
app.get("/bankingDetails", async (req, res) => {
  try {
    // Get the latest payment details
    const latestPaymentDetails = await Payment.findOne().sort({ _id: -1 }).exec();

    if (!latestPaymentDetails) {
      return res.status(404).json({ message: 'No payment details found' });
    }

    // Render the payment details page with the latest payment details
    res.render("bankingDetails", { latestPaymentDetails });
  } catch (error) {
    console.error('Error fetching payment details from MongoDB:', error);
    res.status(500).json({ message: 'Error fetching payment details from MongoDB.' });
  }
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await app.listen(PORT);
    console.log(`Server running on port: ${PORT}`);
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

startServer();
