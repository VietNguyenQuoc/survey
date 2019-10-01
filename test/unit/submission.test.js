let server;
const { Submission } = require('../../models/submission');
const { Survey } = require('../../models/survey');
const mongoose = require('mongoose');

describe('METHODS: Submission.updateSurvey (subAnswer, isNew).', () => {
  let survey;
  const eventCode = '111111'
  const userId = new mongoose.Types.ObjectId();

  beforeEach(async () => {
    server = require('../../index').server;
    survey = new Survey({
      eventCode,
      questions: [
        {
          question: 'a',
          answers: [{ desc: 'one', score: 1 }, { desc: 'two', score: 2 }]
        }
      ],
      startTime: Date.now(),
      endTime: Date.now()
    });

    await survey.save();
  });

  afterEach(async () => {
    await Submission.deleteMany({});
    await Survey.deleteMany({});
    await server.close();
  });

  test('when new submission is made. ', async () => {
    const subAnswer = [survey.questions[0].answers[0]._id.toString()];
    const submission = new Submission({
      eventCode,
      userId,
      answer: subAnswer
    });

    await submission.updateSurvey(subAnswer, true);

    const updatedSurvey = await Survey.findById(survey._id);

    expect(updatedSurvey.submissions).toEqual(1);
    expect(updatedSurvey.totalScore).toEqual(1);
  });

  test('when existing submission is updated. ', async () => {
    // semi-mocking the creation of new submission
    const oldAnswer = [survey.questions[0].answers[0]._id.toString()];
    const submission = new Submission({
      eventCode,
      userId,
      answer: oldAnswer
    });

    await submission.save();

    await survey.update({
      $inc: {
        submissions: 1,
        totalScore: survey.questions[0].answers[0].score
      },
    });

    const newAnswer = [survey.questions[0].answers[1]._id.toString()];

    await submission.updateSurvey(newAnswer, false);

    const updatedSurvey = await Survey.findById(survey._id);

    expect(updatedSurvey.submissions).toEqual(1);
    expect(updatedSurvey.totalScore).toEqual(2);
  });
})