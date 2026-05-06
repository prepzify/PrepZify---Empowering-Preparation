const Resume = require('../models/Resume');
const aiService = require('../services/aiService');

/**
 * POST /api/interview/questions
 * Generate interview questions based on user's skills
 */
const getInterviewQuestions = async (req, res) => {
  try {
    const { role = 'Software Engineer' } = req.body;

    // Get user's skills from resume
    const resume = await Resume.findOne({ userId: req.user.id }).sort({ analyzedAt: -1 });
    const skills = resume?.extractedSkills || ['JavaScript', 'Data Structures', 'Algorithms'];

    const questions = await aiService.generateInterviewQuestions(skills, role);

    res.json({
      message: 'Interview questions generated',
      questions,
    });
  } catch (error) {
    console.error('Interview questions error:', error);
    res.status(500).json({ message: 'Failed to generate interview questions', error: error.message });
  }
};

/**
 * POST /api/interview/evaluate
 * Evaluate a user's interview answer
 */
const evaluateAnswer = async (req, res) => {
  try {
    const { question, answer, expectedPoints } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required' });
    }

    const evaluation = await aiService.evaluateInterviewAnswer(question, answer, expectedPoints);

    res.json({
      message: 'Answer evaluated',
      evaluation,
    });
  } catch (error) {
    console.error('Interview evaluate error:', error);
    res.status(500).json({ message: 'Failed to evaluate answer', error: error.message });
  }
};

module.exports = { getInterviewQuestions, evaluateAnswer };
