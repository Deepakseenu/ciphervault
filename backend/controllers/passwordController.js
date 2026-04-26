const Password = require('../models/Password');
const { encrypt, decrypt } = require('../utils/encryption');

// Get all passwords for logged in user
const getPasswords = async (req, res) => {
  try {
    const passwords = await Password.find({ userId: req.user.id });
    const decrypted = passwords.map(p => ({
      _id: p._id,
      siteName: p.siteName,
      siteUrl: p.siteUrl,
      username: p.username,
      password: decrypt(p.encryptedPassword),
      category: p.category,
      notes: p.notes,
      createdAt: p.createdAt
    }));
    res.json(decrypted);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Add a new password
const addPassword = async (req, res) => {
  const { siteName, siteUrl, username, password, category, notes } = req.body;
  try {
    const encryptedPassword = encrypt(password);
    const newEntry = await Password.create({
      userId: req.user.id,
      siteName, siteUrl, username,
      encryptedPassword,
      category, notes
    });
    res.status(201).json({ message: 'Password saved', id: newEntry._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a password
const updatePassword = async (req, res) => {
  const { siteName, siteUrl, username, password, category, notes } = req.body;
  try {
    const entry = await Password.findOne({ _id: req.params.id, userId: req.user.id });
    if (!entry) return res.status(404).json({ message: 'Not found' });

    entry.siteName = siteName || entry.siteName;
    entry.siteUrl = siteUrl || entry.siteUrl;
    entry.username = username || entry.username;
    entry.encryptedPassword = password ? encrypt(password) : entry.encryptedPassword;
    entry.category = category || entry.category;
    entry.notes = notes || entry.notes;

    await entry.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a password
const deletePassword = async (req, res) => {
  try {
    const entry = await Password.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!entry) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Password deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getPasswords, addPassword, updatePassword, deletePassword };