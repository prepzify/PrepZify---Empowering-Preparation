const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  rawText: {
    type: String,
    required: true,
  },
  extractedSkills: {
    type: [String],
    default: [],
  },
  education: {
    type: [String],
    default: [],
  },
  experience: {
    type: [String],
    default: [],
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  feedback: {
    strengths: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      default: '',
    },
  },
  analyzedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Resume', resumeSchema);
