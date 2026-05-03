const express = require('express');
const router = express.Router();
const { generateTest, submitTest, getTestResults, getTestResult } = require('../controllers/testController');
const auth = require('../middleware/auth');

router.post('/generate', auth, generateTest);
router.post('/submit', auth, submitTest);
router.get('/results', auth, getTestResults);
router.get('/result/:id', auth, getTestResult);

module.exports = router;
