require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const progressRoutes = require('./routes/progressRoutes');
const userRoutes = require('./routes/userRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const errorHandler = require('./middleware/errorHandler');
const { getJwtSecret, isE2EModeEnabled } = require('./config/runtime');

const app = express();

if (!isE2EModeEnabled()) {
  getJwtSecret();
}

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/users', userRoutes);
app.use('/api/submissions', submissionRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', e2eMode: isE2EModeEnabled() });
});

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
