const express = require('express');
const router = express.Router();
const SmartContract = require('../models/SmartContract');
const { authenticateToken } = require('../middleware/auth');

// Tạo mới smart contract
router.post('/contracts/', authenticateToken, async (req, res) => {
  try {
    const { name, type, sourceCode } = req.body;
    const userId = req.user._id || req.user.id || req.user.userId;
    const contract = new SmartContract({
      name,
      type,
      sourceCode,
      createdBy: userId,
    });
    await contract.save();
    res.status(201).json(contract);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Lấy danh sách smart contract của user
router.get('/contracts/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const contracts = await SmartContract.find({ createdBy: userId }).sort({ createdAt: -1 });
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Lấy chi tiết smart contract
router.get('/contracts/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    const contract = await SmartContract.findOne({ _id: req.params.id, createdBy: userId });
    if (!contract) return res.status(404).json({ message: 'Not found' });
    res.json(contract);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Xóa smart contract
router.delete('/contracts/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user.userId;
    console.log('DELETE req.user:', req.user, 'userId:', userId, 'params:', req.params);
    const contract = await SmartContract.findOneAndDelete({ _id: req.params.id, createdBy: userId });
    console.log('DELETE result:', contract);
    if (!contract) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;