const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const router = require('./router');
const { mongoURI } = require('./config');
const cors = require('cors');
require('dotenv').config();

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err.message));

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(router);
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).json({ message: "Bad JSON format" });
  }
  next(err); // If it's not a JSON parse error, pass it to the default error handler
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
