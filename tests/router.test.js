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

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
    verify: jest.fn().mockImplementation((token, secret) => {
        if (token === 'validToken') {
            return { userId: '658aa61ab8605d9c41ebf7fc', role: 'user' }; // Mocked decoded token payload
        }
        throw new Error('Invalid token');
    }),
}));


jest.mock('../models/Users', () => {
    const mockUserInstance = {
        save: jest.fn()
    };

    const mockUserModel = function() {
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
            ObjectId: {
                isValid: jest.fn().mockReturnValue(true)
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

describe('GET /', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use('/', router); // Mount the router
    });

    it('should return server status and shopping list count', async () => {
        // Mocking mongoose connection and methods
        mongoose.connection.db = {
            collection: () => ({
                countDocuments: () => Promise.resolve(1412) // Mock countDocuments to return 1412
            }),
            command: () => Promise.resolve({
                version: 'Mocked Version',
                uptime: 654981935114 // Mock server uptime
            })
        };

        const response = await request(app).get('/');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Welcome to the Shopping List API!');
        expect(response.body).toHaveProperty('shoppingListCount', 1412);
        expect(response.body.serverStatus).toHaveProperty('version', 'Mocked Version');
        expect(response.body.serverStatus).toHaveProperty('databaseUptime', expect.any(String));
    });

    it('should handle errors gracefully', async () => {
        // Mocking mongoose to throw an error
        mongoose.connection.db = {
            collection: () => ({
                countDocuments: () => Promise.reject(new Error('Mock error'))
            })
        };

        const response = await request(app).get('/');

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message', 'Mock error');
    });
});

describe('POST /login', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(bodyParser.json());
        app.use('/', router);
    });

    it('should authenticate the user and return a token', async () => {
        const mockUser = { _id: '123', username: 'user', password: 'hashedPassword', role: 'user' };
        User.findOne.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('mockedToken');

        const response = await request(app)
            .post('/login')
            .send({ username: 'user', password: 'password' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: 'Successfully authenticated',
            userToken: 'mockedToken',
            expiresAt: expect.any(Number)
        });
    });

    it('should return an error for invalid credentials', async () => {
        User.findOne.mockResolvedValue(null); // Simulate user not found

        const response = await request(app)
            .post('/login')
            .send({ username: 'nonexistentUser', password: 'password' });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            message: 'Username or password incorrect'
        });
    });
});


describe('POST /register', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(bodyParser.json());
        app.use('/', router);
    });

    it('should register a new user', async () => {
        User.findOne.mockResolvedValue(null); // Simulate user not found
        bcrypt.hash.mockResolvedValue('hashedPassword'); // Mock bcrypt.hash

        // Create a new user instance and mock its save method
        const mockUser = new User();
        mockUser.save.mockResolvedValue({ username: 'newUser', _id: '123' });

        const response = await request(app)
            .post('/register')
            .send({ username: 'newUser', password: 'password' });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ username: 'newUser', _id: '123' });
        expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
        expect(mockUser.save).toHaveBeenCalled();
    });

    it('should not register a user if the username already exists', async () => {
        User.findOne.mockResolvedValue({ username: 'existingUser' }); // Simulate user found

        const response = await request(app)
            .post('/register')
            .send({ username: 'existingUser', password: 'password' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Username already exists' });
    });
});

describe('POST /getAllLists', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(bodyParser.json());
        app.use('/', router);

        // Mock middleware
        authenticate.mockImplementation((req, res, next) => {
            req.user = { id: 'user123', role: 'user' }; // Default to a non-admin user
            next();
        });
        isAdmin.mockImplementation((req, res, next) => {
            if (req.user && req.user.role === 'admin') {
                next(); // Proceed if user is an admin
            } else {
                res.status(403).json({ message: 'Access denied' }); // Deny access if not an admin
            }
        });
    });

    it('should return all shopping lists for admin users', async () => {
        authenticate.mockImplementationOnce((req, res, next) => {
            req.user = { id: 'admin123', role: 'admin' }; // Mock an admin user
            next();
        });
        ShoppingList.find.mockResolvedValue(mockShoppingLists);

        const response = await request(app).post('/getAllLists');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockShoppingLists);
    });

    it('should deny access for non-admin users', async () => {
        const response = await request(app).post('/getAllLists');

        expect(response.status).toBe(403);
        expect(response.body).toEqual({ message: 'Access denied' });
    });

    it('should handle errors', async () => {
        authenticate.mockImplementationOnce((req, res, next) => {
            req.user = { id: 'admin123', role: 'admin' }; // Mock an admin user
            next();
        });
        ShoppingList.find.mockRejectedValue(new Error('Mocked error'));

        const response = await request(app).post('/getAllLists');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Mocked error' });
    });

    // TODO: more test cases
});

