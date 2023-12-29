const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const router = require('../../router'); 
const ShoppingList = require('../../models/ShoppingList'); 
const {mockShoppingLists, mockUsers} = require('../../mockData/mockData_db');

function filterPublicLists(shoppingLists) {
    return shoppingLists.filter(list => list.isPublic === true);
}

function filterUsersLists(shoppingLists, userId) {
    //console.log(`Filtering lists for user: ${userId}`);
    const userIdent = userId;
    const hisLists = shoppingLists.filter(list => {
        const isOwner = list.ownerId === userIdent;
        //console.log(`List ${list._id}: isOwner=${isOwner}`);
        return isOwner;
    });
    const hisFriendsLists = shoppingLists.filter(list => {
        const isSharedTo = list.sharedTo.includes(userIdent);
        //console.log(`List ${list._id}: isSharedTo=${isSharedTo}`);
        return isSharedTo;
    });

    return hisLists.concat(hisFriendsLists);
}

jest.mock('../../models/ShoppingList');
jest.mock('../../middlewares/authenticate');

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
                    break;
                case 'validTokenAdmin':
                    req.user = {
                        id: 'userIdForValidTokenAdmin',
                        role: 'admin'
                    };
                case 'validTokenUser2':
                    req.user = {
                        id: '658aa61ab8605d9c41ebf7fc',
                        role: 'user'
                    };
                    //console.log("YOUR USER ID IS:"+req.user.id)
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

describe('PUT /updateList/:listId', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(bodyParser.json());
        app.use('/', router);
        ShoppingList.findById.mockClear();
    });

    it('should return 400 if listId is invalid', async () => {
        const response = await request(app)
            .put('/updateList/invalidListId')
            .set('Authorization', 'Bearer validTokenUser');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Invalid ID format');
    });

    it('should return 404 if list does not exist', async () => {
        ShoppingList.findById.mockResolvedValue(null);

        const response = await request(app)
            .put('/updateList/658aa61ab8605d9c41ebf999')
            .set('Authorization', 'Bearer validTokenUser');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'List not found');
    });

    it('should return 403 if user is not authorized to update the list', async () => {
        const list = {
            _id: '658aa61ab8605d9c41ebf999',
            ownerId: 'someOtherUserId',
            sharedTo: [],
            items: [],
        };
        ShoppingList.findById.mockResolvedValue(list);

        const response = await request(app)
            .put(`/updateList/${list._id}`)
            .set('Authorization', 'Bearer validTokenUser')
            .send({ shoppingListName: 'newName' });

        //expect(response.status).toBe(403);
        expect(response.body).toHaveProperty('message', 'Access denied');
    });

    it('should return 400 if trying to update ownerId', async () => {
        const list = {
            _id: '658aa61ab8605d9c41ebf999',
            ownerId: 'userIdForValidTokenUser',
            items: [],
        };
        ShoppingList.findById.mockResolvedValue(list);

        const response = await request(app)
            .put(`/updateList/${list._id}`)
            .set('Authorization', 'Bearer validTokenUser')
            .send({ ownerId: 'someOtherUserId' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Updating ownerId is not allowed.');
    });

    // Add more tests for sharedTo array processing, items array processing, and error handling...
});

describe('POST /getAllPublicLists', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(bodyParser.json());
        app.use('/', router);
        ShoppingList.findById.mockClear();
        ShoppingList.find.mockImplementation(() => {
            return {
                exec: jest.fn().mockResolvedValue(filterPublicLists(mockShoppingLists)),
            };
        });
    });

    it('should return public shopping lists', async () => {
        const response = await request(app)
            .post('/getAllPublicLists')

            //console.log("public lists"+response.body)

        expect(response.status).toBe(200);
    });

});

describe('GET /getMyLists', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(bodyParser.json());
        app.use('/', router);
        ShoppingList.find.mockClear();
    });

    it('should return 401 if no user token is provided', async () => {
        const response = await request(app).get('/getMyLists');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized Access: No user token provided');
    });

    it('should return the lists the user owns or is shared to', async () => {
        const userId = '658aa61ab8605d9c41ebf7fc';
        const userLists = filterUsersLists(mockShoppingLists, userId)
    
        ShoppingList.find.mockImplementation((query) => {
            if (query.$or[0].ownerId === userId || query.$or[1].sharedTo === userId) {
                return Promise.resolve(userLists);
            }
            return Promise.resolve([]);
        });
    
        const response = await request(app)
            .get('/getMyLists')
            .set('Authorization', `Bearer validTokenUser2`);

        //console.log(JSON.stringify(response.body))
        expect(ShoppingList.find).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toEqual(userLists);
    });
});
