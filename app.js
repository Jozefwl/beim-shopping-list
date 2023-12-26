const express = require('express');
const bodyParser = require('body-parser');
const router = require('./router');
const cors = require('cors');
require('dotenv').config();

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

module.exports = app;
