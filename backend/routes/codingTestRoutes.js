const express = require('express');
const router = express.Router();
const { generateChallenge, submitSolution, getHistory } = require('../controllers/codingTestController');
const auth = require('../middleware/auth');

router.post('/generate', auth, generateChallenge);
router.post('/submit', auth, submitSolution);
router.get('/history', auth, getHistory);

module.exports = router;
