const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Joi = require('joi');
const mongoURI = 'mongodb://localhost:27017';

mongoose.connect(mongoURI)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

const app = express();
app.use(bodyParser.json());

// Mongoose schemas and models here
const itemSchemaMongo = new mongoose.Schema({
    name: String,
    category: String,
    quantity: Number,
    checked: Boolean
  });
  
  const shoppingListSchemaMongo = new mongoose.Schema({
    shoppingListName: String,
    name: String,
    items: [itemSchemaMongo],
    ownerId: String, // Assuming ownerId is a string
    sharedTo: [String], // Array of user IDs
    isPublic: Boolean
  });

  const ShoppingList = mongoose.model('ShoppingList', shoppingListSchemaMongo);

// Validation schemas here
const itemSchemaValidation = Joi.object({
    name: Joi.string().required(),
    category: Joi.string().required(),
    quantity: Joi.number().required(),
    checked: Joi.boolean().required()
  });

  const createListSchemaValidation = Joi.object({
    shoppingListName: Joi.string().required(),
    owner: Joi.string().required(),
    sharedTo: Joi.array().items(Joi.string()),
    state: Joi.string().valid('public', 'private').required(),
    items: Joi.array().items(itemSchemaValidation).required() // Joi schema used here
  });

  const updateListSchemaValidation = Joi.object({
    shoppingListName: Joi.string().optional(),
    owner: Joi.string().optional(),
    sharedTo: Joi.array().items(Joi.string()).optional(),
    state: Joi.string().valid('public', 'private').optional(),
    items: Joi.array().items(itemSchemaValidation).optional() // itemSchemaValidation is already defined
  });
  
function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    // Check if the Authorization header is present and starts with 'Bearer '
    if (authHeader && authHeader.startsWith('Bearer ')) {
        // Extract the token from the header
        const token = authHeader.substring(7); // 'Bearer ' is 7 characters

        if (token === 'admin') {
            req.user = { role: 'admin' };
            next();
        } else if (token === 'user') {
            req.user = { role: 'user' };
            next();
        } else {
            res.status(401).send('Unauthorized');
        }
    } else {
        res.status(401).send('No token provided');
    }
}



// Admin check middleware
function isAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next(); // User is an admin, proceed to the next middleware or route handler
    } else {
        res.status(403).send('Access denied'); // User is not an admin, deny access
    }
}

function isUser(req, res, next) {
    if (req.user && req.user.role === 'user') {
        next(); // User is an admin, proceed to the next middleware or route handler
    } else {
        res.status(403).send('Access denied'); // User is not an user, deny access
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// GET command to get all lists
app.get('/getAllLists', authenticate, isAdmin, async (req, res) => {
    try {
        const lists = await ShoppingList.find({});
        res.json(lists);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET command to get a specific list
app.get('/getList/:listId', async (req, res) => {
    const id = req.params.listId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid ID format');
    }
    try {
        const list = await ShoppingList.findById(req.params.listId);
        if (list) {
            res.json(list);
        } else {
            res.status(404).send('List not found');
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST command to create a new list
function validateListUpdate(req, res, next) {
    const validationResult = updateListSchemaValidation.validate(req.body, { abortEarly: false });
  
    if (validationResult.error) {
      return res.status(400).json({ message: validationResult.error.details.map(detail => detail.message) });
    }
  
    next(); // Continue if validation is successful
  }    
  
  app.put('/updateList/:listId', validateListUpdate, async (req, res) => {
    const id = req.params.listId; // Define 'id' from req.params
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid ID format');
    }
  
    try {
      const updatedList = await ShoppingList.findByIdAndUpdate(id, req.body, { new: true });
      if (updatedList) {
        res.json(updatedList);
      } else {
        res.status(404).send('List not found');
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // GET command to get all lists
  app.get('/getSharePermissions/:listId', async (req, res) => {
    const id = req.params.listId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid ID format');
    }
    try {
        const list = await ShoppingList.findById(req.params.listId);
        if (list) {
            res.json({ sharedTo: list.sharedTo, isPublic: list.isPublic });
        } else {
            res.status(404).send('List not found');
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// DELETE command to delete a list
app.delete('/deleteList/:listId', async (req, res) => {
    const id = req.params.listId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid ID format');
    }
    try {
        const list = await ShoppingList.findByIdAndDelete(req.params.listId);
        if (list) {
            res.send('List deleted successfully');
        } else {
            res.status(404).send('List not found');
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST command to create a new list
function validateListCreation(req, res, next) {
    const validationResult = createListSchemaValidation.validate(req.body, { abortEarly: false });
  
    if (validationResult.error) {
      return res.status(400).json({ message: validationResult.error.details.map(detail => detail.message) });
    }
  
    next(); // Continue if validation is successful
  }
  
    app.post('/createList', validateListCreation, async (req, res) => {
      // logic for creating a shopping list
      try {
        const newListData = {
          shoppingListName: req.body.shoppingListName,
          ownerId: req.body.owner,
          sharedTo: req.body.sharedTo,
          isPublic: req.body.state === 'public',
          items: req.body.items
        };
    
        const newList = new ShoppingList(newListData);
        const savedList = await newList.save();
    
        res.status(201).json(savedList);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

app.get('/getAllPublicLists', async (req, res) => {
    try {
        const publicLists = await ShoppingList.find({ isPublic: true });
        res.json(publicLists);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});