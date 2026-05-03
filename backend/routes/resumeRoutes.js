const express = require('express');
const router = express.Router();
const { upload, uploadResume, getResumeAnalysis } = require('../controllers/resumeController');
const auth = require('../middleware/auth');

router.post('/upload', auth, upload.single('resume'), uploadResume);
router.get('/analysis', auth, getResumeAnalysis);

module.exports = router;
