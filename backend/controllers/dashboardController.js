const Resume = require('../models/Resume');
const Test = require('../models/Test');
const StudyPlan = require('../models/StudyPlan');
const aiService = require('../services/aiService');

/**
 * GET /api/dashboard
 * Get aggregated dashboard data for the logged-in user
 */
const getDashboard = async (req, res) => {
  try {
    // Get resume data
    const resume = await Resume.findOne({ userId: req.user.id }).sort({ analyzedAt: -1 });

    // Get all completed tests
    const tests = await Test.find({ userId: req.user.id, completed: true })
      .sort({ completedAt: -1 });

    // Get study plan
    const studyPlan = await StudyPlan.findOne({ userId: req.user.id }).sort({ generatedAt: -1 });

    // Calculate aggregated stats
    const averageTestScore = tests.length > 0
      ? Math.round(tests.reduce((sum, t) => sum + t.score, 0) / tests.length)
      : 0;

    // Collect all weak areas across tests
    const allWeakAreas = {};
    tests.forEach(t => {
      t.weakAreas.forEach(area => {
        allWeakAreas[area] = (allWeakAreas[area] || 0) + 1;
      });
    });

    const weakAreasSorted = Object.entries(allWeakAreas)
      .sort(([, a], [, b]) => b - a)
      .map(([area, count]) => ({ area, frequency: count }));

    // Test score trend (last 10 tests)
    const scoreTrend = tests.slice(0, 10).reverse().map(t => ({
      date: t.completedAt,
      score: t.score,
      type: t.type,
    }));

    // Get company recommendations if resume exists
    let companyRecommendations = null;
    if (resume && resume.extractedSkills.length > 0) {
      try {
        const strongAreas = resume.extractedSkills.slice(0, 5);
        const weakAreasForRec = weakAreasSorted.slice(0, 3).map(w => w.area);

        companyRecommendations = await aiService.recommendCompanies(
          resume.extractedSkills,
          {
            averageScore: averageTestScore,
            strongAreas,
            weakAreas: weakAreasForRec,
          }
        );
      } catch (err) {
        console.error('Company recommendation error:', err.message);
      }
    }

    res.json({
      dashboard: {
        resume: resume ? {
          score: resume.score,
          skillsCount: resume.extractedSkills.length,
          skills: resume.extractedSkills,
          analyzedAt: resume.analyzedAt,
        } : null,
        tests: {
          totalTests: tests.length,
          averageScore: averageTestScore,
          scoreTrend,
          recentTests: tests.slice(0, 5).map(t => ({
            id: t._id,
            type: t.type,
            companyName: t.companyName,
            score: t.score,
            accuracy: t.accuracy,
            completedAt: t.completedAt,
          })),
        },
        weakAreas: weakAreasSorted.slice(0, 8),
        hasStudyPlan: !!studyPlan,
        companyRecommendations: companyRecommendations?.recommendations || null,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to load dashboard', error: error.message });
  }
};

module.exports = { getDashboard };
