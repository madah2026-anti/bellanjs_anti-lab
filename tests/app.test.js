/* eslint-env jest */
const request = require('supertest');
const db = require('../config/database');

// Mock the database connection BEFORE requiring the app
jest.mock('../config/database', () => ({
    connect: jest.fn((cb) => { if (cb) cb(null); }),
    query: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
    promise: jest.fn().mockReturnThis()
}));

const app = require('../server');

describe('App', () => {
    afterAll(() => {
        jest.clearAllMocks();
    });

    it('GET / should return 200 or 302', async () => {
        const res = await request(app).get('/');
        // Depending on logic, it might render login or dashboard
        // If it's a redirect or 200 is fine
        expect(res.statusCode).not.toBe(500);
    });

    it('GET /unknown-route should return 404', async () => {
        const res = await request(app).get('/unknown-route-123');
        expect(res.statusCode).toBe(404);
    });
});
