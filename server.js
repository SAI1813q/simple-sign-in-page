// server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mydb');

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB database');
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});


// MongoDB User Schema
const User = mongoose.model('User', {
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, required: true },
  phoneNumber: String,
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

// Serve static files (HTML, CSS)
app.use(express.static(path.join(__dirname, '/')));

// Handle user registration endpoint
app.post('/register', async (req, res) => {
  const { firstName, lastName, email, phoneNumber, username, password } = req.body;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user
  const newUser = new User({
    firstName,
    lastName,
    email,
    phoneNumber,
    username,
    password: hashedPassword,
  });

  // Save the user to the database
  newUser.save()
    .then(() => {
      res.status(201).json({ message: 'User created successfully' });
    })
    .catch((err) => {
      res.status(400).json({ message: 'Failed to create user', error: err.message });
    });
});

// Serve the HTML registration form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
