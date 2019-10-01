const mongoose = require('mongoose');
const request = require('supertest');
const { User } = require('../../models/user');
let server;

jest.setTimeout(50000);

describe('testing the Internal Server Error 500', () => {

  beforeEach(async () => {
    server = require('../../index').server;
  });

  afterEach(async () => {
    await server.close();
  });

  it('should return 500 when trying to post invalid survey.', async () => {
    const admin = new User({
      email: "123@gmail.com",
      password: "11111111",
      isAdmin: true
    });
    const tokenAdmin = admin.generateAuthToken();

    await mongoose.disconnect();

    const res = await request(server).get('/api/survey').set("x-auth-token", tokenAdmin);

    expect(res.status).toBe(500);
  });
});