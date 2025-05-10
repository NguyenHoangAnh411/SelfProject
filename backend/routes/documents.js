const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Document = require('../models/Document');
const { authenticateToken } = require('../middleware/auth');

// Get all documents for a user
router.get('/documents', authenticateToken, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.userId })
      .sort({ updatedAt: -1 });
    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching documents'
    });
  }
});

// Get a single document
router.get('/documents/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid document ID format'
      });
    }

    const document = await Document.findOne({
      _id: id,
      userId: req.user.userId
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching document'
    });
  }
});

// Create a new document
router.post('/documents', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    const document = new Document({
      title,
      content: content || '',
      userId: req.user.userId
    });

    await document.save();
    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating document'
    });
  }
});

// Update a document
router.put('/documents/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    // Validate ObjectId format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid document ID format'
      });
    }

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Title and content are required'
      });
    }

    const document = await Document.findOneAndUpdate(
      {
        _id: id,
        userId: req.user.userId
      },
      {
        title,
        content,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating document'
    });
  }
});

// Delete a document
router.delete('/documents/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid document ID format'
      });
    }

    const document = await Document.findOneAndDelete({
      _id: id,
      userId: req.user.userId
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: { message: 'Document deleted successfully' }
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting document'
    });
  }
});

module.exports = router; 