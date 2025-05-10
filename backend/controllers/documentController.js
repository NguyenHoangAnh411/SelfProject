const Document = require('../models/Document');

const createDocument = async (req, res) => {
  try {
    console.log('Create document request:', req.body);
    const { title, content, docType } = req.body;
    const document = new Document({
      title,
      content,
      userId: req.user.userId,
      docType: docType || 'normal',
    });
    await document.save();
    console.log('Document created successfully');
    res.status(201).json(document);
  } catch (error) {
    console.error('Create document error:', error);
    res.status(400).json({ message: error.message });
  }
};

const getDocuments = async (req, res) => {
  try {
    console.log('Fetching documents for user:', req.user.userId);
    const documents = await Document.find({ userId: req.user.userId });
    console.log('Found documents:', documents.length);
    res.json(documents);
  } catch (error) {
    console.error('Fetch documents error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getDocumentById = async (req, res) => {
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
};

const updateDocument = async (req, res) => {
  try {
    console.log('Update document request:', req.params.id);
    const { title, content } = req.body;
    const document = await Document.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { title, content, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!document) {
      console.log('Document not found or unauthorized');
      return res.status(404).json({ message: 'Document not found or unauthorized' });
    }
    
    console.log('Document updated successfully');
    res.json(document);
  } catch (error) {
    console.error('Update document error:', error);
    res.status(400).json({ message: error.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    console.log('Delete document request:', req.params.id);
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });
    
    if (!document) {
      console.log('Document not found or unauthorized');
      return res.status(404).json({ message: 'Document not found or unauthorized' });
    }
    
    console.log('Document deleted successfully');
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument
}; 