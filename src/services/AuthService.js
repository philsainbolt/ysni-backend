const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/runtime');
const {
  createUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
  sanitizeUser,
} = require('../store/userStore');

class AuthService {
  static async register(username, email, password) {
    return createUser({ username, email, password });
  }

  static async login(email, password) {
    const user = findUserByEmail(email);
    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    const isPasswordValid = await verifyPassword(user, password);
    if (!isPasswordValid) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    const safeUser = sanitizeUser(user);
    const token = jwt.sign(
      { id: safeUser.id, username: safeUser.username, email: safeUser.email },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    return { user: safeUser, token };
  }

  static async verifyToken(token) {
    return jwt.verify(token, getJwtSecret());
  }

  static getProfile(userId) {
    const user = findUserById(userId);
    return user ? sanitizeUser(user) : null;
  }
}

module.exports = AuthService;
