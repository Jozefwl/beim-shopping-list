const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');
const router = require('../router');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const User = require('../models/Users');
const ShoppingList = require('../models/ShoppingList');
const authenticate = require('../middlewares/authenticate');
const isAdmin = require('../middlewares/isAdmin');
const { mockShoppingLists } = require('../mockData/mockData_db')

jest.mock('../models/ShoppingList');
jest.mock('../middlewares/authenticate');
jest.mock('../middlewares/isAdmin');

// Mock authenticate middleware to simulate different user scenarios
jest.mock('../middlewares/authenticate', () => {
    return jest.fn((req, res, next) => {
        const authHeader = req.headers['authorization'];

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7); // Extract the token

            // Simulate different behaviors based on the token value
            switch (token) {
                case 'validTokenUser':
                    req.user = {
                        id: 'userIdForValidTokenUser',
                        role: 'user'
                    };
                    break;
                case 'validTokenAdmin':
                    req.user = {
                        id: 'userIdForValidTokenAdmin',
                        role: 'admin'
                    };
                    break;
                default:
                    // Invalid token behavior
                    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
            }
        } else {
            // No token
            next();
        }

        next();
    });
});

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
    verify: jest.fn((token, secret) => {
        if (token === 'validTokenUser') {
            return { userId: '658aa61ab8605d9c41ebf7fc', role: 'user' };
        } else if (token === 'validTokenAdmin') {
            return { userId: 'adminUserId', role: 'admin' };
        }
        throw new Error('Invalid token');
    }),
}));

jest.mock('../models/Users', () => {
    const mockUserInstance = {
        save: jest.fn()
    };

    const mockUserModel = function () {
        return mockUserInstance;
    };

    mockUserModel.findOne = jest.fn();

    return mockUserModel;
});

jest.mock('mongoose', () => {
    const mockFind = jest.fn();
    const mockFindOne = jest.fn();
    const mockFindById = jest.fn();
    const mockSave = jest.fn();
    const mockFindByIdAndDelete = jest.fn();
    const mockSelect = jest.fn();

    const shoppingListMock = {
        find: mockFind,
        findOne: mockFindOne,
        findById: mockFindById,
        save: mockSave,
        findByIdAndDelete: mockFindByIdAndDelete,
    };

    const userMock = {
        findOne: mockFindOne,
        save: mockSave,
        find: mockFind,
        select: mockSelect,
    };

    return {
        ...jest.requireActual('mongoose'),
        model: jest.fn((modelName) => {
            if (modelName === 'ShoppingList') return shoppingListMock;
            if (modelName === 'User') return userMock;
            return null;
        }),
        Types: {
            ...jest.requireActual('mongoose').Types,
            ObjectId: {
                ...jest.requireActual('mongoose').Types.ObjectId,
                isValid: jest.fn().mockReturnValue(true),
                isInvalid: jest.fn().mockReturnValue(false)
            }
        },
        connection: {
            db: {
                collection: jest.fn().mockReturnValue({
                    countDocuments: jest.fn().mockResolvedValue(1412),
                }),
                command: jest.fn().mockResolvedValue({
                    version: 'Mocked Version',
                    uptime: 61565646151,
                }),
            },
        },
    };
});

describe('POST /createList', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/', router);

        authenticate.mockReset();
        authenticate.mockImplementation((req, res, next) => {
            const token = req.headers['authorization']?.split(' ')[1];
            if (token === 'validTokenAdmin') {
                req.user = { id: 'adminUserId', role: 'admin' };
            } else {
                req.user = { id: 'defaultUserId', role: 'user' };
            }
            next();
        });
    });

    it('not logged in user should not be able to create a shopping list', async () => {
        const response = await request(app)
            .post('/createList')
            .send({ shoppingListName: 'Test List', items: [{"name": "itembest", "quantity": 69, "checked":false}] });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized Access: No user token provided');
    });

    it('logged in user should be able to create a shopping list', async () => {
        const mockListData = {
            shoppingListName: 'Test List',
            items: [{"name": "itembest", "quantity": 69, "checked":false}],
            // other list details...
        };
        const mockSaveFunction = jest.fn().mockResolvedValue(mockListData);
        ShoppingList.prototype.save = mockSaveFunction;

        const response = await request(app)
            .post('/createList')
            .set('Authorization', `Bearer ${validTokenUser}`)
            .send({ shoppingListName: 'Test List', items: [{"name": "wowtest", "quantity": 162, "checked":false}] });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'List created successfully');
        expect(response.body.list).toHaveProperty('shoppingListName', 'Test List');
        expect(mockSaveFunction).toHaveBeenCalled();
    });

    it('should handle errors properly', async () => {
        const mockError = new Error('Mocked creation error');
        const mockSaveFunction = jest.fn().mockRejectedValue(mockError);
        ShoppingList.prototype.save = mockSaveFunction;

        const response = await request(app)
            .post('/createList')
            .set('Authorization', `Bearer ${validTokenUser}`)
            .send({ shoppingListName: 'Test List', items: [{"name": "wowtest", "quantity": 162}] });

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message', 'Internal Server Error');
        // The exact error message depends on your handleError implementation
    });
});

describe('PUT /updateList/:listId', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(bodyParser.json());
        app.use('/', router);
        ShoppingList.findById.mockReset();
        authenticate.mockReset();
        authenticate.mockImplementation((req, res, next) => {
            // Extract the token to determine the user role
            const token = req.headers['authorization']?.split(' ')[1];
            if (token === 'validTokenAdmin') {
                req.user = { id: 'validTokenAdmin', role: 'admin' };
            } else if (token === 'validTokenUser') {
                // default or other user roles
                req.user = { id: 'userIdForValidTokenUser', role: 'user' };
            } else { }
            next();
        });
    });

    it('should update a list if the user is the owner', async () => {
        const listId = 'validListId';
        const listToUpdate = {
            _id: listId,
            ownerId: 'userIdForValidTokenUser',
            items: [],
        };
        ShoppingList.findById.mockResolvedValue(listToUpdate);

        const response = await request(app)
            .put(`/updateList/${listId}`)
            .set('Authorization', 'Bearer validTokenUser')
            .send({ items: [{ name: "New Item", category: "Groceries", quantity: 2 }] });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Update successful');
    });


    it('should update a list if the user is in sharedTo array', async () => {
        const listId = 'validListId';
        const listToUpdate = {
            _id: listId,
            ownerId: 'someOtherUserId',
            sharedTo: ['userIdForValidTokenUser'],
            items: [],
        };
        ShoppingList.findById.mockResolvedValue(listToUpdate);

        const response = await request(app)
            .put(`/updateList/${listId}`)
            .set('Authorization', 'Bearer validTokenUser')
            .send({ items: [{ name: "Updated Item", category: "Groceries", quantity: 3 }] });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Update successful');
    });

    it('should update a list if the user is an admin', async () => {
        const listId = 'validListId';
        const listToUpdate = {
            _id: listId,
            ownerId: 'someOtherUserId',
            items: [],
        };
        ShoppingList.findById.mockResolvedValue(listToUpdate);

        const response = await request(app)
            .put(`/updateList/${listId}`)
            .set('Authorization', 'Bearer validTokenAdmin')
            .send({ items: [{ name: "Admin Updated Item", category: "Groceries", quantity: 5 }] });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Update successful');
    });


    it('should not update the ownerId', async () => {
        const listId = 'validListId';
        const listToUpdate = {
            _id: listId,
            ownerId: 'userIdForValidTokenUser',
            items: [],
        };
        ShoppingList.findById.mockResolvedValue(listToUpdate);

        const response = await request(app)
            .put(`/updateList/${listId}`)
            .set('Authorization', 'Bearer validTokenUser')
            .send({ ownerId: 'someOtherUserId' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Updating ownerId is not allowed.');
    });

    it('should add a new item if no ID is provided for the item', async () => {
        const listId = 'validListId';
        const listToUpdate = {
            _id: listId,
            ownerId: 'userIdForValidTokenUser',
            items: [],
        };
        ShoppingList.findById.mockResolvedValue(listToUpdate);

        const newItem = {
            name: 'New Item',
            category: 'Category',
            quantity: 1,
            checked: false,
        };

        const response = await request(app)
            .put(`/updateList/${listId}`)
            .set('Authorization', 'Bearer validTokenUser')
            .send({ items: [newItem] });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Update successful');

        // Ensure the new item has been added
        expect(listToUpdate.items).toHaveLength(1);
        expect(listToUpdate.items[0]).toMatchObject(newItem);
    });

    it('should only edit an existing item if an item ID is provided', async () => {
        const listId = 'validListId';
        const existingItem = {
            _id: 'itemId',
            name: 'Existing Item',
            category: 'Category',
            quantity: 1,
            checked: false,
        };
        const listToUpdate = {
            _id: listId,
            ownerId: 'userIdForValidTokenUser',
            items: [existingItem],
        };
        ShoppingList.findById.mockResolvedValue(listToUpdate);

        const updatedItem = {
            _id: 'itemId', // Providing item ID for editing
            name: 'Updated Item',
            category: 'Updated Category',
            quantity: 2,
            checked: true,
        };

        const response = await request(app)
            .put(`/updateList/${listId}`)
            .set('Authorization', 'Bearer validTokenUser')
            .send({ items: [updatedItem] });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Update successful');

        // Ensure the existing item has been edited
        expect(listToUpdate.items).toHaveLength(1);
        expect(listToUpdate.items[0]).toMatchObject(updatedItem);
    });

    it('should check all inputs (name, category, quantity, checked) for new item creation', async () => {
        const listId = 'validListId';
        const listToUpdate = {
            _id: listId,
            ownerId: 'userIdForValidTokenUser',
            items: [],
        };
        ShoppingList.findById.mockResolvedValue(listToUpdate);

        // Missing required 'name' field in the new item
        const newItem = {
            category: 'Category',
            quantity: 1,
            checked: false,
        };

        const response = await request(app)
            .put(`/updateList/${listId}`)
            .set('Authorization', 'Bearer validTokenUser')
            .send({ items: [newItem] });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0]).toHaveProperty('message', 'New items must have proper name, quantity, and checked properties. Check formats carefully.');
    });

    it('should handle errors properly', async () => {
        const listId = 'validListId';
        const updateError = new Error('Mocked update error');
        ShoppingList.findById.mockRejectedValue(updateError);

        const response = await request(app)
            .put(`/updateList/${listId}`)
            .set('Authorization', 'Bearer validTokenUser')
            .send({ items: [{ name: "Error Item", category: "Groceries", quantity: 2 }] });

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message', 'Mocked update error');
    });
});
