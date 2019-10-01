let server;
const request = require('supertest');
const mongoose = require('mongoose');
const { User } = require('../../models/user');

describe('/api/auth', () => {
  let token;
  let password;
  let email;

  beforeEach(async () => {
    server = require('../../index').server;
  });

  afterEach(async () => {
    await User.deleteMany({});
    await server.close();
  });

  // POST /api/auth/register
  //    return 400 when email is not inputted
  //    return 400 when password is not inputted
  //    return 400 when email is wrong format
  //    return 400 when email is longer than 255
  //    return 400 when password is less than 8 character
  //    return 400 when password is more than 50 character
  //    return 400 when password consists of non-alphanum character
  //    return 200 when valid register is inputted

  describe('POST /register', () => {
    const exec = () => {
      return request(server)
        .post('/api/auth/register')
        .send({ email, password });
    }

    it('should return 400 when email is not inputted.', async () => {
      password = '11111111';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 when password is not inputted.', async () => {
      email = '123@gmail.com';
      password = '';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 when email is wrong format.', async () => {
      email = 'aaaaaaaaa';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 when email is longer than 255 character.', async () => {
      email = Array(256).join('a');
      password = '111111111';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 when password is less than 8 character.', async () => {
      email = '123@gmail.com';
      password = '1';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 when password is more than 50 character.', async () => {
      email = '123@gmail.com';
      password = Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 when email is existed.', async () => {
      email = '123@gmail.com';
      password = '11111111';

      const user = new User({ email, password });
      await user.save();

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.text).toMatch('been registered');
    });

    it('should return 200 when valid register is inputted', async () => {
      email = '123@gmail.com';
      password = '11111111'

      const res = await exec();

      expect(res.status).toBe(200);
    });
  });

  // POST /api/auth/admin
  //    return 400 when email is not inputted
  //    return 400 when password is not inputted
  //    return 400 when email is wrong format
  describe('POST /admin', () => {
    beforeEach(async () => {
      const admin = new User({
        email: 'admin@gmail.com',
        password: '11111111',
        isAdmin: true
      });

      token = admin.generateAuthToken();
    });

    const exec = () => {
      return request(server)
        .post('/api/auth/admin')
        .set("x-auth-token", token)
        .send({ email, password });
    };

    it('should return 400 when email is not inputted.', async () => {
      email = '';
      password = '11111111';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 when password is not inputted.', async () => {
      email = '123@gmail.com';
      password = '';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 when email is wrong format.', async () => {
      email = 'aaaaaaaaa';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 when email is longer than 255 character.', async () => {
      email = Array(256).join('a');
      password = '111111111';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 when password is less than 8 character.', async () => {
      email = '123@gmail.com';
      password = '1';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 when password is more than 50 character.', async () => {
      email = '123@gmail.com';
      password = Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 when email is existed.', async () => {
      email = '123@gmail.com';
      password = '11111111';

      const user = new User({ email, password });
      await user.save();

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.text).toMatch('been registered');
    });

    it('should return 200 when valid register is inputted and user contains isAdmin property', async () => {
      email = '123@gmail.com';
      password = '11111111'

      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('isAdmin');
    });
  });

  // POST /api/auth/login
  //    return 400 when email is not inputted
  //    return 400 when password is not inputted
  //    return 400 when email is longer than 255 characters
  //    return 400 when password is longer than 50 characters
  //    return 400 when email is invalid
  //    return 400 when password is invalid
  //    return 200 when valid login

  describe('POST /login', () => {
    beforeEach(async () => {
      await request(server)
        .post('/api/auth/register')
        .send({ email: '123@gmail.com', password: '11111111' });
    });

    const exec = () => {
      return request(server)
        .post('/api/auth/login')
        .send({ email, password });
    }

    it('should return 400 when email is invalid.', async () => {
      email = 'abc@gmail.com';
      password = '11111111';

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.text).toMatch('invalid');
    });

    it('should return 400 when password is invalid.', async () => {
      email = '123@gmail.com';
      password = '22222222';

      const res = await exec();

      expect(res.status).toBe(400);
      expect(res.text).toMatch('invalid');
    });

    it('should return 200 when login valid.', async () => {
      email = '123@gmail.com';
      password = '11111111';

      const res = await exec();

      expect(res.status).toBe(200);
    });
  });

  // DELETE /api/auth/:id
  //    return 404 when user is not found
  //    return 200 when delete sucessfully
  describe('DEL /:id', () => {
    let user;

    beforeEach(async () => {
      const admin = new User({
        email: 'admin@gmail.com',
        password: '11111111',
        isAdmin: true
      });

      token = admin.generateAuthToken();

      const res = await request(server)
        .post('/api/auth/register')
        .send({ email: '123@gmail.com', password: '11111111' });

      user = res.body;
    });

    afterEach(async () => {
      await User.deleteMany({});
    })

    it('should return 404 when user is not found', async () => {
      const id = new mongoose.Types.ObjectId();

      const res = await request(server)
        .delete(`/api/auth/admin/${id}`)
        .set("x-auth-token", token);

      expect(res.status).toBe(404);
    });

    it('should return 200 when delete successfully', async () => {
      const res = await request(server)
        .delete(`/api/auth/admin/${user._id}`)
        .set("x-auth-token", token);

      expect(res.status).toBe(200);
    });
  });
});
