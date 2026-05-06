const StudyPlan = require('../models/StudyPlan');
const Resume = require('../models/Resume');
const Test = require('../models/Test');
const aiService = require('../services/aiService');

/**
 * POST /api/study-plan/generate
 * Generate a personalized AI study plan
 */
const generateStudyPlan = async (req, res) => {
  try {
    // Get resume data
    const resume = await Resume.findOne({ userId: req.user.id }).sort({ analyzedAt: -1 });

    if (!resume) {
      return res.status(400).json({ message: 'Please upload your resume first to generate a study plan.' });
    }

    // Get test results
    const tests = await Test.find({ userId: req.user.id, completed: true })
      .sort({ completedAt: -1 })
      .limit(5);

    // Generate plan with AI
    const plan = await aiService.generateStudyPlan(
      {
        extractedSkills: resume.extractedSkills,
        score: resume.score,
        education: resume.education,
      },
      tests.map(t => ({
        type: t.type,
        score: t.score,
        weakAreas: t.weakAreas,
      }))
    );

    // Save study plan
    const studyPlan = await StudyPlan.findOneAndUpdate(
      { userId: req.user.id },
      {
        userId: req.user.id,
        plan,
        generatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Study plan generated successfully',
      studyPlan: {
        id: studyPlan._id,
        plan: studyPlan.plan,
        generatedAt: studyPlan.generatedAt,
      },
    });
  } catch (error) {
    console.error('Study plan error:', error);
    res.status(500).json({ message: 'Failed to generate study plan', error: error.message });
  }
};

/**
 * GET /api/study-plan
 * Get the latest study plan
 */
const getStudyPlan = async (req, res) => {
  try {
    const studyPlan = await StudyPlan.findOne({ userId: req.user.id }).sort({ generatedAt: -1 });

    if (!studyPlan) {
      return res.status(404).json({ message: 'No study plan found. Generate one from your resume and test data.' });
    }

    res.json({
      studyPlan: {
        id: studyPlan._id,
        plan: studyPlan.plan,
        generatedAt: studyPlan.generatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get study plan', error: error.message });
  }
};

module.exports = { generateStudyPlan, getStudyPlan };
