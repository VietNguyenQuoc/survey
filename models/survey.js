const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const AnswerSchema = new mongoose.Schema({
  desc: {
    type: String,
    maxlength: 255
  },
  score: {
    type: Number,
    min: 0,
    max: 10
  }
});

const QuestionSchema = new mongoose.Schema({
  question: String,
  answers: [AnswerSchema]
});

const SurveySchema = new mongoose.Schema({
  eventCode: {
    type: String,
    unique: true,
    required: true,
    minlength: 6,
    maxlength: 6
  },
  questions: [QuestionSchema],
  totalScore: {
    type: Number,
    default: 0
  },
  avgScore: {
    type: Number,
    default: 0
  },
  submissions: {
    type: Number,
    default: 0
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  }
});

// SurveySchema.statics.populateAnswer = async function (eventCode, subAnswer) {
//   const survey = await this.findOne({ eventCode });

//   const answerP = subAnswer.map(async (a, i) => {
//     let result;
//     survey.questions[i].answers.forEach(element => {
//       if (element._id == a) result = element;
//     });
//     return result;
//   });
//   return await Promise.all(answerP);
// }

SurveySchema.methods = {
  populateAnswer: async function (subAnswer) {
    const answerP = subAnswer.map(async (a, i) => {
      let result;
      this.questions[i].answers.forEach(element => {
        if (element._id == a) result = element;
      });
      return result;
    });
    return await Promise.all(answerP);
  },

  isRunning: function () {
    const currentTime = Date.now();

    return (currentTime >= this.startTime)
      && (currentTime <= this.endTime);
  },

  isStarted: function () {
    const currentTime = Date.now();

    return (currentTime >= this.startTime);
  }
}

SurveySchema.statics = {
  isRunning: async function (id) {
    let survey;

    if (mongoose.Types.ObjectId.isValid(id)) {
      survey = await this.findById(id);
    }
    else {
      survey = await this.findOne({ eventCode: id });
    }
    const currentTime = Date.now();

    return (currentTime >= survey.startTime)
      && (currentTime <= survey.endTime);
  },

  isStarted: async function (id) {
    const survey = await this.findOne({ eventCode });
    const currentTime = Date.now();

    return (currentTime >= survey.startTime);
  }
}

// SurveySchema.methods.populateAnswer = async function (subAnswer) {
//   const answerP = subAnswer.map(async (a, i) => {
//     let result;
//     this.questions[i].answers.forEach(element => {
//       if (element._id == a) result = element;
//     });
//     return result;
//   });
//   return await Promise.all(answerP);
// }

// SurveySchema.statics.updateSubmission = async function (eventCode, subAnswer, isNew) {
//   const survey = await this.findOne({ eventCode });

//   const answerP = subAnswer.map(async (a, i) => {
//     let result;
//     survey.questions[i].answers.forEach(element => {
//       if (element._id == a) result = element;
//     });
//     return result;
//   });
//   const surveyAnswer = await Promise.all(answerP);

//   surveyAnswer.forEach(a => {
//     survey.totalScore += a.score;
//   });

//   if (isNew) survey.submissions++;

//   survey.avgScore = (survey.totalScore / survey.submissions);

//   await survey.save();
// }

// SurveySchema.statics.isRunning = async function (id) {
//   let survey;

//   if (mongoose.Types.ObjectId.isValid(id)) {
//     survey = await this.findById(id);
//   }
//   else {
//     survey = await this.findOne({ eventCode: id });
//   }
//   const currentTime = Date.now();

//   return (currentTime >= survey.startTime)
//     && (currentTime <= survey.endTime);
// }

// SurveySchema.methods.isRunning = function () {
//   const currentTime = Date.now();

//   return (currentTime >= this.startTime)
//     && (currentTime <= this.endTime);
// }

//   SurveySchema.statics.isStarted = async function (id) {
//   const survey = await this.findOne({ eventCode });
//   const currentTime = Date.now();

//   return (currentTime >= survey.startTime);
// }

// SurveySchema.methods.isStarted = function () {
//   const currentTime = Date.now();

//   return (currentTime >= this.startTime);
// }

const Survey = mongoose.model("survey", SurveySchema);

function ValidateSurvey(body) {
  const schema = Joi.object().keys({
    questions: Joi.array().min(1).max(20).required(),
    startTime: Joi.date().required(),
    endTime: Joi.date().required()
  });

  return Joi.validate(body, schema);
}

module.exports.Survey = Survey;
module.exports.ValidateSurvey = ValidateSurvey;