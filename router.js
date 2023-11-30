const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const ShoppingList = require('./models/ShoppingList');
const User = require('./models/Users');
const { createListSchemaValidation, updateListSchemaValidation } = require('./validation');
const authenticate = require('./middlewares/authenticate');
const isAdmin = require('./middlewares/isAdmin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const handleError = (res, error) => res.status(500).json({ message: error.message });
const handleNotFound = (res, item) => item ? res.json(item) : res.status(404).json({ message: 'List not found' });
const handleInvalidId = (res) => res.status(400).json({ message: 'Invalid ID format' });
const handleAccessDenied = (res) => res.status(403).json({ message: 'Access denied' });

// Common validation logic for list updates and creation
function validateList(req, res, next, schemaValidation) {
    const validationResult = schemaValidation.validate(req.body, { abortEarly: false });

    if (validationResult.error) {
        return res.status(400).json({ message: validationResult.error.details.map(detail => detail.message) });
    }

    next(); // Continue if validation is successful
}

// Define all routes here
router.get('/', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        // Fetching the count of documents in a collection
        const shoppingListCount = await db.collection('shoppinglists').countDocuments();
        // const anotherCollectionCount = await db.collection('anotherCollection').countDocuments();
        const serverStatus = await db.command({ serverStatus: 1 });
        const seconds = serverStatus.uptime;
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor(seconds % (3600 * 24) / 3600);
        const minutes = Math.floor(seconds % 3600 / 60);
        const uptimeString = `${days} days, ${hours} hours, ${minutes} minutes`;

        res.status(200).json({
            message: 'Welcome to the Shopping List API!',
            shoppingListCount,
            serverStatus: {
                version: serverStatus.version,
                databaseUptime: uptimeString,
                // Add more server status details as needed
            }
        });
    } catch (error) {
        handleError(res, error);
    }
});

// POST command to login
router.post('/login', async (req, res) => {
    try {
        // Find the user by username
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(401).json({ message: 'Username or password incorrect' });
        }

        // Check if the password is correct
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Username or password incorrect' });
        }

        // Generate a JWT token that includes the user's ID and role
        const token = jwt.sign(
            { 
                userId: user._id, 
                role: user.role  // Include the user's role in the token
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.json({ message: 'Successfully authenticated', userToken: token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});


router.post('/register', async (req, res) => {
    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create a new user and save to database
        const user = new User({
            username: req.body.username,
            password: hashedPassword
            // Role field is not included here
        });
        const savedUser = await user.save();

        // Respond with the created user details (excluding password)
        res.status(201).json({ username: savedUser.username, _id: savedUser._id });
    } catch (error) {
        res.status(500).json({ message: 'Error registering new user', error: error.message });
    }
});

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

    if (!validateObjectId(listId)) return handleInvalidId(res);

    try {
        const list = await ShoppingList.findById(listId);
        if (!list) return handleNotFound(res, null);

        if (list.ownerId !== req.user.id && !list.sharedTo.includes(req.user.id) && req.user.role !== 'admin') {
            return handleAccessDenied(res);
        }

        res.json(list);
    } catch (error) {
        handleError(res, error);
    }
});

// POST command to create a new list


router.put('/updateList/:listId', authenticate, validateList, async (req, res) => {
    const listId = req.params.listId;

    if (!validateObjectId(listId)) return handleInvalidId(res);

    try {
        const list = await ShoppingList.findById(listId);
        if (!list) { return handleNotFound(res, null); }

        // Check if the user is the owner of the list or it's shared with them
        if (list.ownerId !== req.user.id && !list.sharedTo.includes(req.user.id)) {
            return handleAccessDenied(res);
        }

        const updatedList = await ShoppingList.findByIdAndUpdate(listId, req.body, { new: true });
        if (updatedList) {
            res.json(updatedList);
        } else {
            res.status(404).json({ message: 'Updated list not found.' });
        }
    } catch (error) {
        handleError(res, error);
    }
});


// GET command to get share permissions of a list
router.get('/getSharePermissions/:listId', async (req, res) => {
    const listId = req.params.listId;

    if (!validateObjectId(listId)) return handleInvalidId(res);

    try {
        const list = await ShoppingList.findById(req.params.listId);
        if (list) {
            res.json({ sharedTo: list.sharedTo, isPublic: list.isPublic });
        } else {
            handleNotFound(res, null);
        }
    } catch (error) {
        handleError(res, error);
    }
});


// DELETE command to delete a list
router.delete('/deleteList/:listId', authenticate, async (req, res) => {
    const id = req.params.listId;

    if (!validateObjectId(id)) return handleInvalidId(res);

    try {
        const list = await ShoppingList.findById(id);

        if (!list) {
            return handleNotFound(res, null);
        }

        // Check if the user is the owner of the list
        if (list.ownerId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await ShoppingList.findByIdAndDelete(id);
        res.json({ message: 'List deleted successfully' });

    } catch (error) {
        handleError(res, error);
    }
});


// POST command to create a new list
router.post('/createList', authenticate, (req, res, next) => {
    validateList(req, res, next, createListSchemaValidation);
}, async (req, res) => {
    try {
        const ownerId = req.user.id;
        const sharedToUsernames = req.body.sharedTo || [];
        const sharedToUserIds = [];

        // Process 'sharedTo' only if it's provided and not empty
        if (sharedToUsernames.length > 0) {
            for (const username of sharedToUsernames) {
                const user = await User.findOne({ username: username });

                if (!user) {
                    return res.status(400).json({ message: `User ${username} not found` });
                } else if (user._id.toString() === ownerId) {
                    return res.status(400).json({ message: 'SharedTo list cannot include the owner' });
                } else {
                    sharedToUserIds.push(user._id);
                }
            }
        }
        const newListData = {
            shoppingListName: req.body.shoppingListName,
            ownerId: req.user.id, // Set the owner ID to the authenticated user's ID
            sharedTo: sharedToUserIds,
            isPublic: req.body.state === 'public',
            items: req.body.items
        };

        const newList = new ShoppingList(newListData);
        const savedList = await newList.save();

        res.status(201).json({ message: 'List created successfully', list: savedList });
    } catch (error) {
        handleError(res, error);
    }
});


// GET command to get all public lists
router.get('/getAllPublicLists', async (req, res) => {
    try {
        const publicLists = await ShoppingList.find({ isPublic: true });
        res.json(publicLists);
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = router;
