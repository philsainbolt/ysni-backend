const bcrypt = require('bcryptjs');

let nextId = 1;
let users = [];

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

async function createUser({ username, email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedUsername = String(username || '').trim();

  const exists = users.some(
    (u) => u.email === normalizedEmail || u.username.toLowerCase() === normalizedUsername.toLowerCase()
  );

  if (exists) {
    const err = new Error('User already exists');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: String(nextId++),
    username: normalizedUsername,
    email: normalizedEmail,
    passwordHash,
    progressLevel: 1,
    beatenLevels: [],
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  return sanitizeUser(user);
}

function findUserByEmail(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  return users.find((u) => u.email === normalizedEmail) || null;
}

function findUserById(id) {
  return users.find((u) => u.id === String(id)) || null;
}

async function verifyPassword(user, plainPassword) {
  return bcrypt.compare(plainPassword, user.passwordHash);
}

function updateUserProgress(userId, beatenLevels, progressLevel) {
  const user = findUserById(userId);
  if (!user) return null;

  user.beatenLevels = [...beatenLevels];
  user.progressLevel = progressLevel;
  return sanitizeUser(user);
}

function resetUsers() {
  users = [];
  nextId = 1;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
  updateUserProgress,
  sanitizeUser,
  resetUsers,
};
