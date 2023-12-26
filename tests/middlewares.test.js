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
    let nextFunction;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        nextFunction = jest.fn();
        process.env.JWT_SECRET = 'testsecret'; // Set a test secret
    });

    it('should authenticate a valid token', () => {
        const token = 'validToken';
        jwt.verify.mockImplementation(() => ({ userId: '123', role: 'user' })); // Mock a successful token verification
        mockRequest.headers = {
            'authorization': `Bearer ${token}`
        };

        authenticate(mockRequest, mockResponse, nextFunction);

        expect(jwt.verify).toHaveBeenCalledWith(token, 'testsecret');
        expect(mockRequest.user).toEqual({ id: '123', role: 'user' });
        expect(nextFunction).toHaveBeenCalled();
    });

    it('should return 401 for no token provided', () => {
        mockRequest.headers = {};

        authenticate(mockRequest, mockResponse, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized: No token provided' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token', () => {
        const token = 'invalidToken';
        jwt.verify.mockImplementation(() => {
            throw new Error('Invalid token');
        });
        mockRequest.headers = {
            'authorization': `Bearer ${token}`
        };

        authenticate(mockRequest, mockResponse, nextFunction);

        expect(jwt.verify).toHaveBeenCalledWith(token, 'testsecret');
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized: Invalid token', error: 'Invalid token' });
        expect(nextFunction).not.toHaveBeenCalled();
    });
});
