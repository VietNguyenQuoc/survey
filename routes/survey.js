const router = require('express').Router();
const { Survey, ValidateSurvey } = require('../models/survey');
const { Submission, ValidateSubmission } = require('../models/submission');
const Auth = require('../middlewares/auth');
const Admin = require('../middlewares/admin');
const ValidateObjectId = require('../middlewares/objectid');

router.get('/', [Auth, Admin], async (req, res) => {
  const surveys = await Survey.find();

  res.send(surveys);
});

router.get('/:id', [ValidateObjectId, Auth, Admin], async (req, res) => {
  const survey = await Survey.findById(req.params.id);

  if (!survey) return res.status(404).send("The survey is not found.");

  return res.send(survey);
});

router.get('/participant/:eventCode', Auth, async (req, res) => {
  const survey = await Survey.findOne({ eventCode: req.params.eventCode });

  if (!survey) return res.status(404).send("The survey is not found.");

  if (!survey.isRunning())
    return res.status(400).send("The survey has not been started yet.");

  return res.send(survey);
});

router.post('/', [Auth, Admin], async (req, res) => {
  const { error } = ValidateSurvey(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const questions = req.body.questions;
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;

  // Generate random 6 digit string for the survey code
  const eventCode = Math.floor(Math.random() * 899999 + 100000).toString();

  const survey = new Survey({
    eventCode,
    questions,
    startTime: new Date(startTime),
    endTime: new Date(endTime)
  });

  await survey.save();

  return res.send(survey);
});

router.post('/submit', Auth, async (req, res) => {
  const { error } = ValidateSubmission(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const userId = req.body.userId;
  const eventCode = req.body.eventCode;
  const subAnswer = req.body.answer;

  const isRunning = await Survey.isRunning(eventCode);
  if (!isRunning) return res.status(400).send("The survey has not been started yet.");

  // const surveyAnswer = await Survey.populateAnswer(eventCode, subAnswer);
  // console.log(surveyAnswer);

  let submission = await Submission.findOne({
    userId,
    eventCode
  });

  // if (sm) return res.status(400).send("You have already submited the survey.");
  if (!submission) {
    submission = new Submission({
      userId,
      eventCode,
      answer: subAnswer
    });

    await submission.updateSurvey(subAnswer, true);
  } else {
    // update the score in survey before update the submission
    await submission.updateSurvey(subAnswer, false);
    submission.answer = subAnswer;
  }

  await submission.save();

  return res.send(submission);
});

router.put('/:id', [ValidateObjectId, Auth, Admin], async (req, res) => {
  const { error } = ValidateSurvey(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // const survey = await Survey.findByIdAndUpdate(req.params.id, {
  //   questions: req.body.questions
  // }, { new: true });

  const survey = await Survey.findById(req.params.id);
  if (!survey) return res.status(404).send("Survey not found.");

  const isStarted = await survey.isStarted();
  if (isStarted) return res.status(400).send("The survey has been started.");

  survey.questions = req.body.questions;
  survey.startTime = req.body.startTime;
  survey.endTime = req.body.endTime;
  await survey.save();

  return res.send(survey);
});

router.delete('/:id', [ValidateObjectId, Auth, Admin], async (req, res) => {
  const survey = await Survey.findById(req.params.id);
  if (!survey) return res.status(404).send("Survey not found.");

  const isStarted = await survey.isStarted();
  if (isStarted) return res.status(400).send("The survey has been started.");

  await Survey.findByIdAndDelete(req.params.id);

  return res.send(survey);
});

module.exports = router;