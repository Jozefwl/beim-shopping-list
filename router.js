const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const ShoppingList = require('./models/ShoppingList');
const { createListSchemaValidation, updateListSchemaValidation } = require('./validation');
const authenticate = require('./middlewares/authenticate');
const isAdmin = require('./middlewares/isAdmin');

// Define all routes here
router.get('/', (req, res) => res.send('Hello, World!'));

// GET command to get all lists
router.get('/getAllLists', authenticate, isAdmin, async (req, res) => {
    try {
        const lists = await ShoppingList.find({});
        res.json(lists);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET command to get a specific list
router.get('/getList/:listId', authenticate, async (req, res) => {
    const listId = req.params.listId;

    if (!mongoose.Types.ObjectId.isValid(listId)) {
        return res.status(400).json({ message: 'Invalid ID format' });
    }

    try {
        const list = await ShoppingList.findById(listId);

        if (!list) {
            return res.status(404).send('List not found');
        }

        // Check if the user is the owner of the list
        if (list.ownerId !== req.user.id && !list.sharedTo.includes(req.user.id)) {
            return res.status(403).send('Access denied');
        }

        res.json(list);
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

router.put('/updateList/:listId', authenticate, validateListUpdate, async (req, res) => {
    const listId = req.params.listId;

    if (!mongoose.Types.ObjectId.isValid(listId)) {
        return res.status(400).send('Invalid ID format');
    }

    try {
        const list = await ShoppingList.findById(listId);
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }

        // Check if the user is the owner of the list or it's shared with them
        if (list.ownerId !== req.user.id && !list.sharedTo.includes(req.user.id)) {
            return res.status(403).send('Access denied');
        }

        const updatedList = await ShoppingList.findByIdAndUpdate(listId, req.body, { new: true });
        if (updatedList) {
            res.json(updatedList);
        } else {
            res.status(404).send('List not found');
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// GET command to get share permissions of a list
router.get('/getSharePermissions/:listId', async (req, res) => {
    const id = req.params.listId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
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
router.delete('/deleteList/:listId', authenticate, async (req, res) => {
    const id = req.params.listId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
    }

    try {
        const list = await ShoppingList.findById(id);

        if (!list) {
            return res.status(404).send('List not found');
        }

        // Check if the user is the owner of the list
        if (list.ownerId !== req.user.id) {
            return res.status(403).send('Access denied');
        }

        await ShoppingList.findByIdAndDelete(id);
        res.json({ message: 'List deleted successfully' });
        
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

router.post('/createList', authenticate, validateListCreation, async (req, res) => {
    // logic for creating a shopping list
    try {
        const newListData = {
            shoppingListName: req.body.shoppingListName,
            ownerId: req.user.id, // Set the owner ID to the authenticated user's ID
            sharedTo: req.body.sharedTo,
            isPublic: req.body.state === 'public',
            items: req.body.items
        };

        const newList = new ShoppingList(newListData);
        const savedList = await newList.save();

        res.status(201).json({ message: 'List created successfully', list: savedList });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// GET command to get all public lists
router.get('/getAllPublicLists', async (req, res) => {
    try {
        const publicLists = await ShoppingList.find({ isPublic: true });
        res.json(publicLists);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
