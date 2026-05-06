const Test = require('../models/Test');
const Resume = require('../models/Resume');
const aiService = require('../services/aiService');

/**
 * POST /api/test/generate
 * Generate a new test (resume-based or company-based)
 */
const generateTest = async (req, res) => {
  try {
    const { type = 'resume-based', difficulty = 'medium', count = 10, companyName = '' } = req.body;

    let questions;

    if (type === 'company-based') {
      // Company-based test (AI Model 2)
      if (!companyName) {
        return res.status(400).json({ message: 'Company name is required for company-based tests' });
      }

      // Calculate STS score from previous tests
      const previousTests = await Test.find({ userId: req.user.id, completed: true });
      const stsScore = previousTests.length > 0
        ? Math.round(previousTests.reduce((sum, t) => sum + t.score, 0) / previousTests.length)
        : 50; // Default score if no previous tests

      questions = await aiService.generateCompanyQuestions(stsScore, companyName, count);
    } else {
      // Resume-based test (AI Model 1)
      const resume = await Resume.findOne({ userId: req.user.id }).sort({ analyzedAt: -1 });

      if (!resume || resume.extractedSkills.length === 0) {
        return res.status(400).json({ message: 'Please upload and analyze your resume first to generate resume-based tests.' });
      }

      questions = await aiService.generateResumeBasedQuestions(resume.extractedSkills, difficulty, count);
    }

    // Create test in DB
    const test = await Test.create({
      userId: req.user.id,
      type,
      companyName,
      difficulty,
      questions,
      totalQuestions: questions.length,
      completed: false,
    });

    res.json({
      message: 'Test generated successfully',
      test: {
        id: test._id,
        type: test.type,
        companyName: test.companyName,
        difficulty: test.difficulty,
        totalQuestions: test.totalQuestions,
        questions: test.questions.map(q => ({
          question: q.question,
          options: q.options,
          topic: q.topic,
          difficulty: q.difficulty,
        })),
      },
    });
  } catch (error) {
    console.error('Generate test error:', error);
    res.status(500).json({ message: 'Failed to generate test', error: error.message });
  }
};

/**
 * POST /api/test/submit
 * Submit answers and get results
 */
const submitTest = async (req, res) => {
  try {
    const { testId, answers } = req.body;

    if (!testId || !answers) {
      return res.status(400).json({ message: 'Test ID and answers are required' });
    }

    const test = await Test.findOne({ _id: testId, userId: req.user.id });

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    if (test.completed) {
      return res.status(400).json({ message: 'Test already submitted' });
    }

    // Calculate score
    let correctCount = 0;
    const topicScores = {};

    test.questions.forEach((q, i) => {
      const userAnswer = answers[i] || '';
      const isCorrect = userAnswer === q.correctAnswer;

      if (isCorrect) correctCount++;

      // Track per-topic performance
      const topic = q.topic || 'General';
      if (!topicScores[topic]) {
        topicScores[topic] = { correct: 0, total: 0 };
      }
      topicScores[topic].total++;
      if (isCorrect) topicScores[topic].correct++;
    });

    const score = Math.round((correctCount / test.questions.length) * 100);
    const accuracy = Math.round((correctCount / test.questions.length) * 100);

    // Determine weak areas (topics with < 50% accuracy)
    const weakAreas = Object.entries(topicScores)
      .filter(([, data]) => (data.correct / data.total) < 0.5)
      .map(([topic]) => topic);

    // Update test
    test.userAnswers = answers;
    test.score = score;
    test.accuracy = accuracy;
    test.correctCount = correctCount;
    test.weakAreas = weakAreas;
    test.completed = true;
    test.completedAt = new Date();
    await test.save();

    res.json({
      message: 'Test submitted successfully',
      result: {
        id: test._id,
        score,
        accuracy,
        correctCount,
        totalQuestions: test.questions.length,
        weakAreas,
        topicBreakdown: topicScores,
        questions: test.questions.map((q, i) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          userAnswer: answers[i] || '',
          isCorrect: answers[i] === q.correctAnswer,
          explanation: q.explanation,
          topic: q.topic,
        })),
      },
    });
  } catch (error) {
    console.error('Submit test error:', error);
    res.status(500).json({ message: 'Failed to submit test', error: error.message });
  }
};

/**
 * GET /api/test/results
 * Get all test results for the logged-in user
 */
const getTestResults = async (req, res) => {
  try {
    const tests = await Test.find({ userId: req.user.id, completed: true })
      .sort({ completedAt: -1 })
      .select('type companyName difficulty score accuracy correctCount totalQuestions weakAreas completedAt');

    res.json({ tests });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get test results', error: error.message });
  }
};

/**
 * GET /api/test/result/:id
 * Get a specific test result with full details
 */
const getTestResult = async (req, res) => {
  try {
    const test = await Test.findOne({ _id: req.params.id, userId: req.user.id });

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.json({
      test: {
        id: test._id,
        type: test.type,
        companyName: test.companyName,
        difficulty: test.difficulty,
        score: test.score,
        accuracy: test.accuracy,
        correctCount: test.correctCount,
        totalQuestions: test.totalQuestions,
        weakAreas: test.weakAreas,
        completed: test.completed,
        completedAt: test.completedAt,
        questions: test.questions.map((q, i) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          userAnswer: test.userAnswers[i] || '',
          isCorrect: test.userAnswers[i] === q.correctAnswer,
          explanation: q.explanation,
          topic: q.topic,
          difficulty: q.difficulty,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get test result', error: error.message });
  }
};

module.exports = { generateTest, submitTest, getTestResults, getTestResult };
