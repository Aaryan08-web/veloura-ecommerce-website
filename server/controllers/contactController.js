import Contact from '../models/Contact.js';
import { isDbConnected } from '../config/db.js';
import { memoryDb } from '../utils/inMemoryStore.js';

export const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email and message are required.' });
    }

    if (!isDbConnected()) {
      const contact = memoryDb.contacts.create({ name, email, subject, message });
      return res.status(201).json({ message: 'Thanks for reaching out! We will get back to you shortly.', contact });
    }

    const contact = await Contact.create({ name, email, subject, message });
    res.status(201).json({ message: 'Thanks for reaching out! We will get back to you shortly.', contact });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit message.', error: err.message });
  }
};

// Admin
export const listContacts = async (req, res) => {
  if (!isDbConnected()) {
    return res.json({ contacts: memoryDb.contacts.getAll() });
  }
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.json({ contacts });
};

export const updateContactStatus = async (req, res) => {
  if (!isDbConnected()) {
    const contact = memoryDb.contacts.updateStatus(req.params.id, req.body.status);
    return res.json({ contact });
  }
  const contact = await Contact.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json({ contact });
};
