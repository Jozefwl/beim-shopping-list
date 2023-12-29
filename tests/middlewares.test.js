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
const { mockShoppingLists } = require('../mockData/mockData')

jest.mock('jsonwebtoken', () => ({
    verify: jest.fn(),
}));

describe('isAdmin middleware', () => {
    it('should allow admin users', () => {
        const req = { user: { role: 'admin' } };
        const res = {};
        const next = jest.fn();

        isAdmin(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it('should deny access to non-admin users', () => {
        const req = { user: { role: 'user' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        const next = jest.fn();

        isAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Access denied' });
        expect(next).not.toHaveBeenCalled();
    });
});


describe('authenticate middleware', () => {
    let mockRequest;
    let mockResponse;
    let nextFunction = jest.fn();

    beforeEach(() => {
        mockRequest = { headers: {} };
        mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        nextFunction.mockClear(); // Clear mock history before each test
    });

    it('decodes userId and role if user token is provided', () => {
        const testToken = 'validToken';
        const decodedToken = { userId: '12345', role: 'user' };
        jwt.verify = jest.fn().mockReturnValue(decodedToken);
        mockRequest.headers['authorization'] = `Bearer ${testToken}`;

        authenticate(mockRequest, mockResponse, nextFunction);

        expect(jwt.verify).toHaveBeenCalledWith(testToken, process.env.JWT_SECRET);
        expect(mockRequest.user).toEqual({ id: decodedToken.userId, role: decodedToken.role });
        expect(nextFunction).toHaveBeenCalled();
    });

    it('returns 401 if invalid token is entered', () => {
        const testToken = 'invalidToken';
        jwt.verify = jest.fn(() => { throw new Error('Invalid token'); });
        mockRequest.headers['authorization'] = `Bearer ${testToken}`;

        authenticate(mockRequest, mockResponse, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized: Invalid token', error: 'Invalid token' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('does nothing if no token is provided', () => {
        authenticate(mockRequest, mockResponse, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(mockRequest.user).toBeUndefined();
    });
});
