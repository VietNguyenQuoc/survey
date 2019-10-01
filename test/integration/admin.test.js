let server;
const app = require('../../index').app;
const request = require('supertest');
const Auth = require('../../middlewares/auth');
const Admin = require('../../middlewares/admin');
const { User } = require('../../models/user');

describe('middlewares/auth.js Authentication middleware', () => {
  beforeAll(() => {
    app.get('/api/test/admin', [Auth, Admin], async (req, res) => {
      res.send("OK");
    });
  })

  beforeEach(async () => {
    server = require('../../index').server;
  });

  afterEach(async () => {
    await server.close();
  });

  it('should return 403 when user is not admin', async () => {
    const user = new User({
      email: "123@gmail.com",
      password: "11111111"
    });

    const token = user.generateAuthToken();

    const res = await request(server)
      .get('/api/test/admin')
      .set("x-auth-token", token)

    expect(res.status).toBe(403);
    expect(res.text).toMatch("Unauthorized");
  });

  it('should return 200 when token is valid.', async () => {
    const user = new User({
      email: "123@gmail.com",
      password: "11111111",
      isAdmin: true
    });

    const token = user.generateAuthToken();

    const res = await request(server)
      .get('/api/test/admin')
      .set("x-auth-token", token)

    expect(res.status).toBe(200);
  });
});