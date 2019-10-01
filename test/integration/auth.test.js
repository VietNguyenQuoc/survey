let server;
const app = require('../../index').app;
const request = require('supertest');
const Auth = require('../../middlewares/auth');
const { User } = require('../../models/user');

describe('middlewares/auth.js Authentication middleware', () => {
  beforeAll(() => {
    app.get('/api/test/auth', Auth, async (req, res) => {
      res.send("OK");
    });
  })

  beforeEach(async () => {
    server = require('../../index').server;
  });

  afterEach(async () => {
    await server.close();
  });

  it('should return 401 when the token is not provided', async () => {
    const res = await request(server).get('/api/test/auth');

    expect(res.status).toBe(401);
    expect(res.text).toMatch('Token');
  });

  it('should return 401 when the token is not provided', async () => {
    const res = await request(server)
      .get('/api/test/auth')
      .set("x-auth-token", "1234")

    expect(res.status).toBe(401);
    expect(res.text).toMatch("denied");
  });

  it('should return 200 when token is valid.', async () => {
    const user = new User({
      email: "123@gmail.com",
      password: "11111111"
    });

    const token = user.generateAuthToken();

    const res = await request(server)
      .get('/api/test/auth')
      .set("x-auth-token", token)

    expect(res.status).toBe(200);
  });
});