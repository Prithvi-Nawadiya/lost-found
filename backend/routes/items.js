const express = require('express');
const Item = require('../models/Item');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Add item
router.post('/', authMiddleware, async (req, res) => {
  try {
    const newItem = new Item({
      ...req.body,
      ReportedBy: req.user.id
    });
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// View all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find().populate('ReportedBy', 'Name Email');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Search
router.get('/search', async (req, res) => {
  try {
    const { name, category } = req.query;
    let query = {};
    if (name) {
      query.ItemName = { $regex: name, $options: 'i' };
    }
    if (category) {
      query.Type = category;
    }
    const items = await Item.find(query).populate('ReportedBy', 'Name Email');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// View item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('ReportedBy', 'Name Email');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update item
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.ReportedBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete item
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.ReportedBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
