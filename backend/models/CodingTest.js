const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
});

const testResultSchema = new mongoose.Schema({
  testCase: { type: Number },
  input: { type: String },
  expectedOutput: { type: String },
  actualOutput: { type: String },
  passed: { type: Boolean },
  notes: { type: String, default: '' },
});

const codingTestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  language: {
    type: String,
    enum: ['java', 'c', 'cpp', 'python', 'javascript'],
    required: true,
  },
  mode: {
    type: String,
    enum: ['resume-based', 'company-based'],
    default: 'resume-based',
  },
  companyName: {
    type: String,
    default: '',
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  // Problem data
  problem: {
    title: { type: String, required: true },
    description: { type: String, required: true },
    inputFormat: { type: String, default: '' },
    outputFormat: { type: String, default: '' },
    constraints: { type: [String], default: [] },
    examples: [{
      input: String,
      output: String,
      explanation: String,
    }],
    topics: { type: [String], default: [] },
    optimalComplexity: {
      time: { type: String, default: '' },
      space: { type: String, default: '' },
    },
  },
  starterCodes: {
    python: { type: String, default: '' },
    javascript: { type: String, default: '' },
    java: { type: String, default: '' },
    cpp: { type: String, default: '' },
    c: { type: String, default: '' },
  },
  hints: {
    type: [String],
    default: [],
  },
  testCases: [testCaseSchema],
  // Submission data
  userCode: {
    type: String,
    default: '',
  },
  score: {
    type: Number,
    default: 0,
  },
  evaluation: {
    feedback: { type: String, default: '' },
    strengths: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
    complexity: {
      time: { type: String, default: '' },
      space: { type: String, default: '' },
      analysis: { type: String, default: '' },
    },
    codeQuality: {
      readability: { type: Number, default: 0 },
      efficiency: { type: Number, default: 0 },
      correctness: { type: Number, default: 0 },
      edgeCases: { type: Number, default: 0 },
    },
    testResults: [testResultSchema],
    optimalSolution: { type: String, default: '' },
    compilationIssues: { type: String, default: 'None' },
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

module.exports = mongoose.model('CodingTest', codingTestSchema);
