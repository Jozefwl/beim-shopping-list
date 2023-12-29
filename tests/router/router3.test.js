const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
//--------------------  -------------------- 
const router = require('../../router'); 
const ShoppingList = require('../../models/ShoppingList'); 
const User = require('../../models/Users');
const authenticate = require('../../middlewares/authenticate');
const isAdmin = require('../../middlewares/isAdmin');
const { mockShoppingLists, mockUsers } = require('../../mockData/mockData_db')
process.env.JWT_SECRET = 'anIusgHnih4g9ggffKgersjedircs0bmda3';


jest.mock('../../models/ShoppingList');
jest.mock('../../middlewares/authenticate');
jest.mock('../../middlewares/isAdmin');

// Mock authenticate middleware to simulate different user scenarios
jest.mock('../../middlewares/authenticate', () => {
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
                    console.log('Auth header:', authHeader);
                    console.log('Token:', token);
                    console.log('req.user:', req.user);
                    break;
                case 'validTokenAdmin':
                    req.user = {
                        id: 'userIdForValidTokenAdmin',
                        role: 'admin'
                    };
                    console.log('Auth header:', authHeader);
                    console.log('Token:', token);
                    console.log('req.user:', req.user);
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
            return { userId: 'defaultUserId', role: 'user',  };
        } else if (token === 'validTokenAdmin') {
            return { userId: 'adminUserId', role: 'admin' };
        }
        throw new Error('Invalid token');
    }),
}));

jest.mock('../../models/Users', () => {
    return {
        find: jest.fn().mockImplementation((query) => {
            if(query._id){
            const userIds = query._id.$in;
            if (userIds.some(id => ['invalidUserId1', 'invalidUserId2'].includes(id))) {
                // Simulate a failed query with invalid IDs
                throw new Error('Invalid user IDs');
            }
            return {
                select: jest.fn().mockResolvedValue([{ _id: 'validUserId', username: 'validUsername' }]),
            };
        }
        if(query.username){
            const usernames = query.username.$in;
            if (usernames.some(username => ['nonExistentUsername','invalidUsername1', 'invalidUsername2'].includes(username))) {
                // Simulate a failed query with invalid usernames
                throw new Error("The following usernames do not exist in the database: " + usernames);
            }
            return {
                select: jest.fn().mockResolvedValue(usernames.map(username => ({ _id: 'defaultUserId', username: 'validUsername' }))),
            };
        }
        }),
        findOne: jest.fn(),
        save: jest.fn(),
    };
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

jest.mock('../../models/ShoppingList', () => {
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

        //console.log(response.body)
        //console.log(response.body.list)
        expect(response.status).toBe(201);
        expect(response.body.message).toEqual('List created successfully');
        expect(response.body.list.shoppingListName).toEqual(newListData.shoppingListName);
        expect(response.body.list.isPublic).toEqual(newListData.isPublic);
        expect(response.body.list.items).toHaveLength(newListData.items.length);
    });

    it('should check if every item has the proper properties', async () => {
        const newListData = {
            "shoppingListName": "TestShoppingList",
            "isPublic": true,
            "items": [
                {
                    "name": "item1",
                    "quantity": 1,
                    "checyked": false
                },
                {
                    "navme": "item2",
                    "quantity": 1,
                    "checked": false
                },
                {
                    "name": "item3",
                    "quanatity": 1,
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

        //console.log(response.body)
        //console.log(response.body.list)
        expect(response.status).toBe(400);
        expect(response.body.message);
    });

    it('should not allow creation if sharedTo usernames are not in db', async () => {
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
            ],
            "sharedTo": [
                "invalidUsername1"
            ]
        }

        // Create a token for a user
        const token = jwt.sign({ id: 'defaultUserId', role: 'user' }, process.env.JWT_SECRET);

        const response = await request(app)
        .post('/createList')
        .send(newListData)
        .set('Authorization', `Bearer ${token}`);

        //console.log(response.body)
        //console.log(response.body.list)
        //expect(response.status).toBe(400);
        expect(response.body.message).toEqual('The following usernames do not exist in the database: invalidUsername1');
    });
    
    it('should not allow creation if sharedTo contains owner', async () => {
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
            ],
            "sharedTo": [
                "validUsername" // owner's username
            ]
        }
    
        // Create a token for a user
        const token = jwt.sign({ id: 'defaultUserId', role: 'user' }, process.env.JWT_SECRET);
    
        const response = await request(app)
            .post('/createList')
            .send(newListData)
            .set('Authorization', `Bearer ${token}`);
    
        //console.log(response.body)
        expect(response.status).toBe(400);
        expect(response.body.errors[0].message).toEqual('The list of people you are sharing to cannot include the owner');
    });

    it('should return 401 if no user token is provided', async () => {
        const response = await request(app)
            .post('/createList')
            .send({ shoppingListName: 'Test Shopping List' });
    
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: 'Unauthorized Access: No user token provided' });
    });
});

describe('POST /getUsernames', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(bodyParser.json());
        app.use(authenticate);
        app.use('/', router);
        User.find.mockClear();
    });

    it('should return 401 if no user token is provided', async () => {
        const response = await request(app).post('/getUsernames');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized Access: No user token provided');
    });

    it('should return 400 if input is not an array of user IDs', async () => {
        const response = await request(app)
            .post('/getUsernames')
            .set('Authorization', 'Bearer validTokenUser')
            .send({ userIds: 'notAnArray' });

            console.log('Authorization header:', response.request.header['Authorization']);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Invalid input: Expected an array of user IDs');
    });

    it('should return 400 if no valid user IDs are provided', async () => {
        const response = await request(app)
            .post('/getUsernames')
            .set('Authorization', 'Bearer validTokenUser')
            .send({ userIds: ['invalidUserId1', 'invalidUserId2'] });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Invalid input: No valid user IDs provided');
    });

    it('should return a mapping of user IDs to usernames', async () => {
        const mockUsernames = [
            { _id: 'validUserId1', username: 'validUsername1' },
            { _id: 'validUserId2', username: 'validUsername2' }
        ];
        const userIds = mockUsernames.map(user => user._id);
        const usernameMap = mockUsernames.reduce((map, user) => {
            map[user._id] = user.username;
            return map;
        }, {});
    
        User.find.mockImplementation((query) => {
            if (query._id.$in.every(id => userIds.includes(id))) {
                // Return an array of user objects with only _id and username fields
                return {
                    select: jest.fn().mockResolvedValue(mockUsernames.filter(user => query._id.$in.includes(user._id))),
                };
            }
            return {
                select: jest.fn().mockResolvedValue([]),
            };
        });
    
        const response = await request(app)
            .post('/getUsernames')
            .set('Authorization', 'Bearer validTokenUser')
            .send({ userIds });
    
        expect(User.find).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(response.body).toEqual(usernameMap);
    });
});

describe('POST /refreshToken', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(bodyParser.json());
        app.use('/', router);
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

    it('should return 401 if no user token is provided', async () => {
        const response = await request(app).post('/refreshToken');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: 'Unauthorized Access: No user token provided' });
    });

    it('should return a new token if a valid user token is provided', async () => {
        const token = jwt.sign({ id: 'defaultUserId', role: 'user' }, process.env.JWT_SECRET);

        const response = await request(app)
            .post('/refreshToken')
            .set('Authorization', `Bearer ${token}`);

        //console.log(jwt.verify(response.body.newToken, process.env.JWT_SECRET))
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('userToken');
        expect(jwt.verify(response.body.userToken, process.env.JWT_SECRET)).toEqual({ userId: 'defaultUserId', role: 'user'});
    });

    it('should return 401 if an invalid user token is provided', async () => {

        const response = await request(app)
            .post('/refreshToken')
            .set('Authorization', `Bearer hjahaLOOOL`);

        //console.log(jwt.verify(response.body.newToken, process.env.JWT_SECRET))
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message');
    });
});