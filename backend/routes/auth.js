const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { Name, Email, Password } = req.body;
    
    if (!Name || !Email || !Password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ Email });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Duplicate email registration' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Password, salt);
    
    const user = new User({ Name, Email, Password: hashedPassword });
    await user.save();
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { Email, Password } = req.body;
    
    if (!Email || !Password) {
      return res.status(400).json({ message: 'Please provide Email and Password' });
    }

    const user = await User.findOne({ Email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid login credentials' });
    }

    const isMatch = await bcrypt.compare(Password, user.Password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid login credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.json({ token, user: { id: user._id, Name: user.Name, Email: user.Email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

module.exports = router;
