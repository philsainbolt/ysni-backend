const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true,
  },

  // Canonical field
  userPrompt: {
    type: String,
  },

  // Legacy field retained for compatibility with current controller/service calls
  userInput: {
    type: String,
  },

  llmResponse: {
    type: String,
    required: true,
  },
  success: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

submissionSchema.index({ userId: 1, challengeId: 1, createdAt: -1 });
submissionSchema.index({ userId: 1, success: 1, createdAt: -1 });

// Keep userPrompt/userInput aligned whichever one caller sets
submissionSchema.pre('validate', function(next) {
  if (!this.userPrompt && this.userInput) this.userPrompt = this.userInput;
  if (!this.userInput && this.userPrompt) this.userInput = this.userPrompt;
  if (!this.userPrompt && !this.userInput) {
    return next(new Error('Either userPrompt or userInput is required.'));
  }
  next();
});

module.exports = mongoose.model('Submission', submissionSchema);
