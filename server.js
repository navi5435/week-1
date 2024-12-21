const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/digital-wallet', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define schemas and models
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  balance: Number,
  transactions: [{ date: Date, amount: Number, type: String }],
});

const User = mongoose.model('User', UserSchema);

// Routes
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const newUser = new User({ username, password, balance: 0, transactions: [] });
  await newUser.save();
  res.json(newUser);
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (user) res.json(user);
  else res.status(400).json({ error: 'Invalid credentials' });
});

app.post('/transaction', async (req, res) => {
  const { userId, amount, type } = req.body;
  const user = await User.findById(userId);
  user.balance += type === 'credit' ? amount : -amount;
  user.transactions.push({ date: new Date(), amount, type });
  await user.save();
  res.json(user);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
