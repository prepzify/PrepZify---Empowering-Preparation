const express = require('express');
const router = express.Router();
const { generateStudyPlan, getStudyPlan } = require('../controllers/studyPlanController');
const auth = require('../middleware/auth');

router.post('/generate', auth, generateStudyPlan);
router.get('/', auth, getStudyPlan);

module.exports = router;
