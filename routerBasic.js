const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const ShoppingList = require('./models/ShoppingList');
const { createListSchemaValidation, updateListSchemaValidation } = require('./validation');
const authenticate = require('./middlewares/authenticate');
const isAdmin = require('./middlewares/isAdmin');



// Function to validate the update data
function validateListUpdate(req, res, next) {
    const validationResult = updateListSchemaValidation.validate(req.body, { abortEarly: false });

    if (validationResult.error) {
        return res.status(400).json({ message: validationResult.error.details.map(detail => detail.message) });
    }

    next(); // Continue if validation is successful
}

// Functon to validate the creation data
function validateListCreation(req, res, next) {
    const validationResult = createListSchemaValidation.validate(req.body, { abortEarly: false });

    if (validationResult.error) {
        return res.status(400).json({ message: validationResult.error.details.map(detail => detail.message) });
    }

    next(); // Continue if validation is successful
}

// Define all routes here
router.get('/', (req, res) => res.status(200).json({ message: 'Hello, World!' }));

// GET command to get all lists
router.get('/getAllLists', authenticate, isAdmin, (req, res) => {
    res.status(200).json({ message: 'Random content for getAllLists' });
});

// GET command to get a specific list
router.get('/getList/:listId', authenticate, (req, res) => {
    res.status(200).json({ dtoIn: { listId: req.params.listId } });
});

// PUT command to update a list
router.put('/updateList/:listId', authenticate, validateListUpdate, async (req, res) => {
    res.json({ dtoIn: { listId: req.params.listId, updateData: req.body } });
});

// GET command to get share permissions of a list
router.get('/getSharePermissions/:listId', (req, res) => {
    res.status(200).json({ dtoIn: { listId: req.params.listId } });
});

// DELETE command to delete a list
router.delete('/deleteList/:listId', authenticate, async (req, res) => {
    res.json({ dtoIn: { listId: req.params.listId } });
});

// POST command to create a new list
router.post('/createList', authenticate, validateListCreation, async (req, res) => {
    res.status(201).json({ dtoIn: req.body });
});

// GET command to get all public lists
router.get('/getAllPublicLists', (req, res) => {
    res.status(200).json({ message: 'Random content for getAllPublicLists' });
});

module.exports = router;

module.exports = router;
