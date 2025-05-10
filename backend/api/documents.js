const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const Document = require('../models/Document');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Apply authentication middleware to all routes
app.use(authenticateToken);

// Create document
app.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    const document = new Document({
      title,
      content,
      userId: req.user.userId,
    });
    await document.save();
    res.status(201).json(document);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all documents
app.get('/', async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.userId });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get document by id
app.get('/:id', async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });
    if (!document) {
      return res.status(404).json({ message: 'Document not found or unauthorized' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update document
app.put('/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    const document = await Document.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { title, content, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found or unauthorized' });
    }
    
    res.json(document);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete document
app.delete('/:id', async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found or unauthorized' });
    }
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = app; 