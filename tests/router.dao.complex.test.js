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
process.env.JWT_SECRET = 'anIusgHnih4g9ggffKgersjedircs0bmda3';

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
    sign: jest.fn((payload, secret, options) => {
        if (secret !== process.env.JWT_SECRET) {
            throw new Error('Invalid secret');
        }
        // You can return a mock token here
        return 'validTokenUser';
    }),
    verify: jest.fn((token, secret) => {
        if (secret !== process.env.JWT_SECRET) {
            throw new Error('Invalid secret');
        }
        if (token === 'validTokenUser') {
            // Return the userId that you want for your tests
            return { userId: 'defaultUserId', role: 'user' };
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
                isValid: jest.fn().mockImplementation((id) => typeof id === 'string' && id.length <= 32), //goofy ahh parameter
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

jest.mock('../models/ShoppingList', () => {
    return jest.fn().mockImplementation((listData) => {
        return {
            save: jest.fn().mockResolvedValue(listData), // Return the list data when save is called
            findById: jest.fn(), 
        };
    });
});

describe('POST /createList', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(bodyParser.json());
        app.use('/', router);
        ShoppingList.mockClear(); // Reset the mock
        authenticate.mockReset();
        // Setup default mock implementation for authenticate
        authenticate.mockImplementation((req, res, next) => {
            // Extract the token to determine the user role
            const token = req.headers['authorization']?.split(' ')[1];
            if (token === 'validTokenAdmin') {
                req.user = { id: 'adminUserId', role: 'admin' };
            } else if (token === 'validTokenUser') {
                // default or other user roles
                req.user = { id: 'defaultUserId', role: 'user' };
            } else {}
            next();
        });
    });

    it('should create a new list', async () => {
        const newListData = {
            "shoppingListName": "TestShoppingList",
            "isPublic": true,
            "items": [
                {
                    "name": "item1",
                    "quantity": 1,
                    "checked": false
                },
                {
                    "name": "item2",
                    "quantity": 1,
                    "checked": false
                },
                {
                    "name": "item3",
                    "quantity": 1,
                    "checked": false
                }
            ]
        }

        // Create a token for a user
        const token = jwt.sign({ id: 'defaultUserId', role: 'user' }, process.env.JWT_SECRET);

        const response = await request(app)
        .post('/createList')
        .send(newListData)
        .set('Authorization', `Bearer ${token}`);

        console.log(response.body)
        console.log(response.body.list)
        expect(response.status).toBe(201);
        expect(response.body.message).toEqual('List created successfully');
        expect(response.body.list.shoppingListName).toEqual(newListData.shoppingListName);
        expect(response.body.list.isPublic).toEqual(newListData.isPublic);
        expect(response.body.list.items).toHaveLength(newListData.items.length);
    });
    
    it('should return 401 if no user token is provided', async () => {
        const response = await request(app)
            .post('/createList')
            .send({ shoppingListName: 'Test Shopping List' });
    
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: 'Unauthorized Access: No user token provided' });
    });
});


/*
describe('PUT /updateList/:listId', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(bodyParser.json());
        app.use('/', router);
        ShoppingList.findById = jest.fn();
    });

    it('should update the list if the user is authorized', async () => {
        const listData = {
            _id: 'validListId',
            shoppingListName: 'Old List Name',
            ownerId: 'validUserId',
            sharedTo: [],
            isPublic: false,
            items: []
        };

        const updatedListData = {
            shoppingListName: 'New List Name',
            isPublic: true,
            items: [{ name: 'New Item', quantity: 1, checked: false }]
        };

        ShoppingList.findById.mockResolvedValue({
            ...listData,
            save: jest.fn().mockResolvedValue({ ...listData, ...updatedListData })
        });

        const response = await request(app)
            .put(`/updateList/${listData._id}`)
            .set('Authorization', 'Bearer validToken')
            .send(updatedListData);

            console.log(response.body)
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ ...listData, ...updatedListData });
    });

    // Add more tests...
});

*/