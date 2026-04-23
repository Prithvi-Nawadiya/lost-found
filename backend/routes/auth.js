const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { Name, Email, Password } = req.body;
    const existingUser = await User.findOne({ Email });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Duplicate email registration' });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);
    const user = new User({ Name, Email, Password: hashedPassword });
    await user.save();
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { Email, Password } = req.body;
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
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
