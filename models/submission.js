const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const { Survey } = require('../models/survey');
const Joi = require('joi');

const SubmissionSchema = new mongoose.Schema({
  userId: {
    type: ObjectId,
    required: true
  },
  eventCode: {
    type: String,
    required: true
  },
  answer: [ObjectId]
});

SubmissionSchema.methods.updateSurvey = async function (subAnswer, isNew) {
  const survey = await Survey.findOne({ eventCode: this.eventCode });

  if (!isNew) {
    const oldAnswer = await survey.populateAnswer(
      this.answer.map(a => a.toString())
    );

    oldAnswer.forEach(a => {
      survey.totalScore -= a.score;
    });
  } else {
    survey.submissions++;
  }

  const newAnswer = await survey.populateAnswer(subAnswer);

  // console.log(oldAnswer, ' ', newAnswer);
  newAnswer.forEach(a => {
    survey.totalScore += a.score;
  });

  survey.avgScore = (survey.totalScore / survey.submissions);

  await survey.save();
}

const Submission = mongoose.model('submission', SubmissionSchema);

function ValidateSubmission(body) {
  const schema = Joi.object().keys({
    userId: Joi.objectId().required(),
    eventCode: Joi.string().length(6).required(),
    answer: Joi.array().items(Joi.objectId())
  });

  return Joi.validate(body, schema);
}

module.exports.Submission = Submission;
module.exports.ValidateSubmission = ValidateSubmission;
