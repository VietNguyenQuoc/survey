const { User } = require('../../models/user');
const config = require('config');
const jwt = require('jsonwebtoken');

describe('user.generateAuthToken()', () => {
  it('should return a token with full properties.', () => {
    const user = new User({
      email: '123@gmail.com',
      password: '12345678'
    });

    const token = user.generateAuthToken();
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));

    expect(decoded).toHaveProperty('email');
    expect(decoded).not.toHaveProperty('password');
    expect(decoded).toHaveProperty('isAdmin');
  });
})