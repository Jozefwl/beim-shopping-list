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
const handleError = (res, error) => {
    //console.error('Error:', error);
    res.status(500).json({ message: error.message });
};
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

// Function to get user IDs from usernamess
async function getUserIdsFromUsernames(usernames) {
    const users = await User.find({ username: { $in: usernames } }).select('_id username');
    const userIdMap = {};
    const invalidUsernames = [];

    for (const username of usernames) {
        const user = users.find(u => u.username === username);
        if (user) {
            userIdMap[username] = user._id.toString();
        } else {
            invalidUsernames.push(username);
        }
    }

    if (invalidUsernames.length > 0) {
        throw new Error("The following usernames do not exist in the database: " + invalidUsernames.join(', '));
    }

    return userIdMap;
}

// Function to verify user credentials and generate a JWT token
async function verifyUserAndGenerateToken(username, password) {
    const user = await User.findOne({ username: username });
    if (!user) {
        return { error: 'Username or password incorrect', status: 401 };
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return { error: 'Username or password incorrect', status: 401 };
    }

    const expirationDuration = 60 * 60; // 60 minutes in seconds
    const expirationTimestamp = Math.floor(Date.now() / 1000) + expirationDuration;
    
    const token = jwt.sign(
        { userId: user._id, role: user.role, exp: expirationTimestamp },
        process.env.JWT_SECRET
    );

    return { token: token, userId: user._id, expiresAt: expirationTimestamp, status: 200 };
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
            }
        });
    } catch (error) {
        handleError(res, error);
    }
});

// POST command to login
router.post('/login', async (req, res) => {
    try {
        const result = await verifyUserAndGenerateToken(req.body.username, req.body.password);
        if (result.error) {
            return res.status(result.status).json({ message: result.error });
        }
        res.json({ message: 'Successfully authenticated', userToken: result.token, expiresAt: result.expiresAt });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

// POST command to register
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

// POST command to get all lists
router.post('/getAllLists', authenticate, isAdmin, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized Access: No user token provided' });
    }
    try {
        const lists = await ShoppingList.find({});
        res.json(lists);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/getList/:listId', authenticate, async (req, res) => {
    const listId = req.params.listId;

    if (validateObjectId(listId) === false) return handleInvalidId(res);

    try {
        const list = await ShoppingList.findById(listId);
        if (!list) return handleNotFound(res);

        // If the list is not public, check user authorization
        if (!list.isPublic) {
            if (!req.user) {
                // User is not authenticated
                return res.status(401).json({ message: 'Unauthorized: Access denied' });
            }

            // Check if the user is authorized to view the list
            if (list.ownerId !== req.user.id && !list.sharedTo.includes(req.user.id) && req.user.role !== 'admin') {
                return handleAccessDenied(res);
            }
        }

        // User is authorized or list is public
        res.json(list);
    } catch (error) {
        handleError(res, error);
    }
});

//PUT command to update a list
router.put('/updateList/:listId', authenticate, validateList, async (req, res) => {
    const listId = req.params.listId;

    if (!validateObjectId(listId)) return handleInvalidId(res);

    try {
        let errors = [];
        const list = await ShoppingList.findById(listId);
        if (!list) return handleNotFound(res);

        // Check authorization
        const isAuthorized = list.ownerId === req.user.id || list.sharedTo.includes(req.user.id) || req.user.role === 'admin';
        if (!isAuthorized) return handleAccessDenied(res);

        // Prevent changing ownerId
        if ('ownerId' in req.body) {
            return res.status(400).json({ message: "Updating ownerId is not allowed." });
        }

        if ('sharedTo' in req.body && Array.isArray(req.body.sharedTo)) {
            const userIdMap = await getUserIdsFromUsernames(req.body.sharedTo);
            req.body.sharedTo = req.body.sharedTo.map(username => userIdMap[username] || username);
        }

        // Process items updates and additions
        if ('items' in req.body && Array.isArray(req.body.items)) {
            if (req.body.items.length === 0) {
                errors.push({ message: "Items array cannot be empty." });
            }
            // Convert usernames to user IDs for DB
            req.body.items.forEach(item => {
                if (item._id) {
                    const itemIndex = list.items.findIndex(existingItem => existingItem._id.toString() === item._id);
                    if (itemIndex !== -1) {
                        // Update only specified fields of the item
                        if ('name' in item) {
                            list.items[itemIndex].name = item.name;
                        }
                        if ('category' in item) {
                            list.items[itemIndex].category = item.category;
                        }
                        if ('checked' in item) {
                            list.items[itemIndex].checked = item.checked;
                        }
                        // Delete item if quantity is 0
                        if ('quantity' in item && item.quantity === 0) {
                            list.items.splice(itemIndex, 1); // Remove the item from the list
                        } else if ('quantity' in item) {
                            list.items[itemIndex].quantity = item.quantity;
                        }                          
                        } else {
                            errors.push({ message: "Item not found", itemId: item._id });
                        }
                    } else {
                        const newItem = {
                            name: item.name,
                            category: item.category || 'Other', // Default category to 'Other' if not provided
                            quantity: item.quantity,
                            checked: item.checked
                        };
                
                        // Validate new item
                        if (typeof newItem.name !== 'string' || typeof newItem.quantity !== 'number' || typeof newItem.checked !== 'boolean') {
                            errors.push({ message: "New items must have proper name, quantity, and checked properties. Check formats carefully." });
                        } else {
                            list.items.push(newItem); // Add the new item to the list
                        }
                    }
                });
        }
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        // Update other fields of the list
        Object.keys(req.body).forEach(key => {
            if (key !== 'items') { // Ignore the 'items' field for now
                list[key] = req.body[key];
            }
        });

        const updatedList = await list.save();
        res.json(updatedList);
    } catch (error) {
        handleError(res, error);
    }
});

// DELETE command to delete a list
router.delete('/deleteList/:listId', authenticate, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: Access denied' });
    }
    const id = req.params.listId;

    if (!validateObjectId(id)) return handleInvalidId(res);

    try {
        const list = await ShoppingList.findById(id);

        if (!list) {
            return handleNotFound(res, null);
        }

        // Check if the user is the owner of the list
        if (list.ownerId == req.user.id || req.user.role == 'admin') {
            await ShoppingList.findByIdAndDelete(id);
            res.json({ message: 'List deleted successfully' });
            
        } else {
            return res.status(403).json({ message: 'Access denied, you are not the owner of the list.', reqUserId: req.user.id, listOwnerId: list.ownerId });
        }

       

    } catch (error) {
        console.error('Error deleting list:', error);
        handleError(res, error);
    }
});


// POST command to create a new list
router.post('/createList', authenticate, (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized Access: No user token provided' });
    }
    validateList(req, res, next, createListSchemaValidation);
}, async (req, res) => {
    try {
        const ownerId = req.user.id;
        let errors = [];
        const sharedToUsernames = req.body.sharedTo || [];
        const sharedToUserIds = [];

        // Process 'sharedTo'
        if (sharedToUsernames.length > 0) {
            const userIdMap = await getUserIdsFromUsernames(sharedToUsernames);
            for (const username of sharedToUsernames) {
                const userId = userIdMap[username];
                if (!userId) {
                    errors.push({ message: `User ${username} not found` });
                } else if (userId === ownerId) {
                    errors.push({ message: 'The list of people you are sharing to cannot include the owner' });
                } else {
                    sharedToUserIds.push(userId);
                }
            }
        }

       // Validate and process list items
       if (req.body.items && Array.isArray(req.body.items)) {
        req.body.items = req.body.items.map(item => {
            // Set default category if not provided
            if (!item.category) {
                item.category = 'Other';
            }
            if(item.quantity === 0 || item.quantity < 0){
                item.quantity = 1
            }
            return item;
        });

        // Further validation for each item
        req.body.items.forEach(item => {
            if (typeof item.name !== 'string' || typeof item.quantity !== 'number' || typeof item.checked !== 'boolean') {
                errors.push({ message: "Please check if you entered the name, quantity, and checked properties." });
            }
        });
    }
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        const newListData = {
            shoppingListName: req.body.shoppingListName,
            ownerId: req.user.id, // Set the owner ID to the authenticated user's ID
            sharedTo: sharedToUserIds,
            isPublic: req.body.isPublic,
            items: req.body.items
        };

        const newList = new ShoppingList(newListData);
        const savedList = await newList.save();

        res.status(201).json({ message: 'List created successfully', list: savedList });
    } catch (error) {
        handleError(res, error);
    }
});


// POST command to get all public lists
router.post('/getAllPublicLists', async (req, res) => {
    try {
        const publicLists = await ShoppingList.find({ isPublic: true });
        res.json(publicLists);
    } catch (error) {
        handleError(res, error);
    }
});

// GET command to get user's lists
router.get('/getMyLists', authenticate, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized Access: No user token provided' });
    }
    try {
        const userId = req.user.id; // Assuming authenticate middleware sets req.user

        // Fetch lists where the logged-in user is the owner or in the sharedTo array
        const userLists = await ShoppingList.find({
            $or: [
                { ownerId: userId }, // User is the owner
                { sharedTo: userId }, // User is in the sharedTo array
            ],
        });

        res.json(userLists);
    } catch (error) {
        handleError(res, error);
    }
});

// POST command to get usernames for given user IDs
router.post('/getUsernames', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized Access: No user token provided' });
    }
    try {
        const inputUserIds = req.body.userIds;
        if (!Array.isArray(inputUserIds)) {
            return res.status(400).json({ message: 'Invalid input: Expected an array of user IDs' });
        }

        // Filter valid user IDs
        const validUserIds = inputUserIds.filter(userId => mongoose.Types.ObjectId.isValid(userId));
        if (validUserIds.length === 0) {
            return res.status(400).json({ message: 'Invalid input: No valid user IDs provided' });
        }

        // Find users with the provided IDs
        const users = await User.find({ _id: { $in: validUserIds } }).select('username _id');

        // Create a mapping of user IDs to usernames
        const usernameMap = users.reduce((map, user) => {
            map[user._id.toString()] = user.username;
            return map;
        }, {});

        res.json(usernameMap);
    } catch (error) {
        console.error('Error:', error);
        if (error.message === 'Invalid user IDs') {
            return res.status(400).json({ message: 'Invalid input: No valid user IDs provided' });
        }
        res.status(500).json({ message: 'Internal server error: '+error.message });
    }
});

// POST command to refresh token
router.post('/refreshToken', authenticate, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized Access: No user token provided' });
    }
    try {
        const newToken = jwt.sign(
            { userId: req.user.id, role: req.user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

    const expirationDuration = 60 * 60; // 60 minutes in seconds
    const expirationTimestamp = Math.floor(Date.now() / 1000) + expirationDuration;

        res.json({message: "Successfully renewed token", userToken: newToken, expiresAt: expirationTimestamp });
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = router;
