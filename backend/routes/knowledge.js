const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const { authenticateToken } = require('../middleware/auth');

// Lấy tất cả trang tri thức
router.get('/', authenticateToken, async (req, res) => {
  const pages = await Document.find({ type: 'knowledge' }).sort({ updatedAt: -1 });
  res.json(pages);
});

// Lấy chi tiết 1 trang
router.get('/:id', authenticateToken, async (req, res) => {
  const page = await Document.findOne({ _id: req.params.id, type: 'knowledge' });
  if (!page) return res.status(404).json({ message: 'Not found' });
  res.json(page);
});

// Tạo mới
router.post('/', authenticateToken, async (req, res) => {
  const { title, content, tags, parentId } = req.body;
  const page = new Document({
    title,
    content,
    type: 'knowledge',
    tags,
    parentId: parentId || null,
    userId: req.user.userId,
    createdBy: req.user.userId,
    updatedBy: req.user.userId,
  });
  await page.save();
  res.status(201).json(page);
});

// Sửa
router.put('/:id', authenticateToken, async (req, res) => {
  const { title, content, tags, parentId } = req.body;
  const page = await Document.findOneAndUpdate(
    { _id: req.params.id, type: 'knowledge' },
    {
      title,
      content,
      tags,
      parentId: parentId || null,
      updatedBy: req.user.userId,
      updatedAt: Date.now(),
    },
    { new: true }
  );
  if (!page) return res.status(404).json({ message: 'Not found' });
  res.json(page);
});

// Xóa
router.delete('/:id', authenticateToken, async (req, res) => {
  const page = await Document.findOneAndDelete({ _id: req.params.id, type: 'knowledge' });
  if (!page) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router; 