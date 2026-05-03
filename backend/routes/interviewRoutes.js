const express = require('express');
const router = express.Router();
const { getInterviewQuestions, evaluateAnswer } = require('../controllers/interviewController');
const auth = require('../middleware/auth');

router.post('/questions', auth, getInterviewQuestions);
router.post('/evaluate', auth, evaluateAnswer);

module.exports = router;
