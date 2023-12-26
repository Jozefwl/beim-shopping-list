const app = require('./app');
const mongoURI = process.env.MONGO_URI;
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err.message));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
