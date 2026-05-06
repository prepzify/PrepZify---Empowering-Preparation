const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume');
const aiService = require('../services/aiService');

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

/**
 * POST /api/resume/upload
 * Upload and analyze a resume
 */
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    // Parse PDF text
    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ message: 'Could not extract sufficient text from PDF. Please upload a text-based PDF.' });
    }

    // Analyze with AI
    const analysis = await aiService.analyzeResume(resumeText);

    // Save or update resume in DB
    const resume = await Resume.findOneAndUpdate(
      { userId: req.user.id },
      {
        userId: req.user.id,
        fileName: req.file.originalname,
        rawText: resumeText,
        extractedSkills: analysis.extractedSkills || [],
        education: analysis.education || [],
        experience: analysis.experience || [],
        score: analysis.score || 0,
        feedback: analysis.feedback || {},
        analyzedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Resume analyzed successfully',
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        extractedSkills: resume.extractedSkills,
        education: resume.education,
        experience: resume.experience,
        score: resume.score,
        feedback: resume.feedback,
        analyzedAt: resume.analyzedAt,
      },
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ message: 'Failed to analyze resume', error: error.message });
  }
};

/**
 * GET /api/resume/analysis
 * Get the latest resume analysis for the logged-in user
 */
const getResumeAnalysis = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id }).sort({ analyzedAt: -1 });

    if (!resume) {
      return res.status(404).json({ message: 'No resume analysis found. Please upload your resume first.' });
    }

    res.json({
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        extractedSkills: resume.extractedSkills,
        education: resume.education,
        experience: resume.experience,
        score: resume.score,
        feedback: resume.feedback,
        analyzedAt: resume.analyzedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get resume analysis', error: error.message });
  }
};

module.exports = { upload, uploadResume, getResumeAnalysis };
