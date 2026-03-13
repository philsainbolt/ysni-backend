const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  // Canonical challenge fields
  level: {
    type: Number,
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  systemPrompt: {
    type: String,
    required: true,
  },
  secretPassword: {
    type: String,
  },
  explanation: {
    type: String,
    required: true,
  },
  nextTechniqueHint: {
    type: String,
  },

  // Legacy compatibility fields used by current seed/services/controllers
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  technique: {
    type: String,
    required: true,
  },
  secret: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

challengeSchema.index({ level: 1 }, { unique: true, sparse: true });
challengeSchema.index({ order: 1 }, { unique: true, sparse: true });

// Keep secretPassword and secret aligned regardless of which field code writes to
challengeSchema.pre('save', function(next) {
  if (!this.secretPassword && this.secret) this.secretPassword = this.secret;
  if (!this.secret && this.secretPassword) this.secret = this.secretPassword;
  if (!this.level && this.order) this.level = this.order;
  if (!this.order && this.level) this.order = this.level;
  next();
});

module.exports = mongoose.model('Challenge', challengeSchema);
