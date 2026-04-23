require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://lostfound-frontend-yxbp.onrender.com'
  ],
  credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api', authRoutes);
app.use('/api/items', itemRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Lost & Found Backend API is Live");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));